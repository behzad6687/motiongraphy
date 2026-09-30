// Capture crisp full-page screenshots of portfolio sites for the 9:16 ad.
//   node scripts/capture_sites.mjs <slug>=<url> [...]      (env: DEVICE=mobile|desktop|both, MAX_CSS_H)
// Writes public/sites/<slug>/{mobile,desktop}.jpg + meta.json (css height, sticky header height).
// Optional env: EXTRA_HIDE (extra CSS selectors to hide, e.g. a popup), RETRIES (default 3).
// Proxy/CA handling for the cloud sandbox is opt-in via env: CCR_PROXY, CCR_SPKI.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("public/sites");
const MAX_CSS_H = Number(process.env.MAX_CSS_H ?? 6400);
const which = process.env.DEVICE ?? "both";
const args = ["--no-sandbox", "--disable-http2", "--disable-quic"];
if (process.env.CCR_SPKI)
  args.push(`--ignore-certificate-errors-spki-list=${process.env.CCR_SPKI}`);
const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? undefined,
  args,
  proxy: process.env.CCR_PROXY ? { server: process.env.CCR_PROXY } : undefined,
});

const DEVICES = {
  mobile: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2.5,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  },
  desktop: {
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.25,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36",
  },
};

// hide chat launchers, cookie banners and similar overlays that would stamp every frame
const HIDE_CSS = `
  html { scroll-behavior: auto !important; }
  [id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i],
  [class*="chat-widget" i], [id*="chat-widget" i], [class*="ask-sol" i], [id*="ask-sol" i],
  iframe[src*="chat" i], [class*="intercom" i], [id*="intercom" i], #hubspot-messages-iframe-container,
  [class*="tawk" i], [id*="tawk" i], .grecaptcha-badge { display: none !important; }
  ${process.env.EXTRA_HIDE ? `${process.env.EXTRA_HIDE} { display: none !important; }` : ""}
`;
const RETRIES = Number(process.env.RETRIES ?? 3);

async function capture(slug, url, kind) {
  const ctx = await browser.newContext(DEVICES[kind]);
  const page = await ctx.newPage();
  const passChallenge = async () => {
    for (let i = 0; i < 24; i++) {
      await page.waitForTimeout(2500);
      const t = await page.title().catch(() => "One moment");
      if (!/One moment/i.test(t)) return;
    }
    throw new Error("stuck on the bot-check page");
  };
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await passChallenge();
  // the host's bot check serves its challenge page in place of CSS/images until the
  // cookie is set — reload once with the cookie so every subresource is real
  await page.reload({ waitUntil: "domcontentloaded", timeout: 90000 });
  await passChallenge();
  await page
    .waitForLoadState("networkidle", { timeout: 45000 })
    .catch(() => {});
  const styled = await page.evaluate(() => {
    let rules = 0;
    for (const sh of document.styleSheets) {
      try {
        rules += sh.cssRules.length;
      } catch {
        rules += 1;
      }
    }
    return rules;
  });
  if (styled < 3) throw new Error(`page looks unstyled (${styled} css rules)`);
  await page.addStyleTag({ content: HIDE_CSS });
  // walk the page so lazy images load and scroll-reveal animations fire
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
  // re-request images that came back broken (the bot check can eat a few), then
  // wait until every image above the capture limit has decoded
  for (let pass = 0; pass < 3; pass++) {
    const broken = await page.evaluate(
      ({ maxY, pass }) => {
        let n = 0;
        for (const img of document.images) {
          const top = img.getBoundingClientRect().top + window.scrollY;
          if (top > maxY) continue;
          img.loading = "eager";
          if (img.complete && img.naturalWidth === 0 && img.currentSrc) {
            const src = img.currentSrc;
            img.removeAttribute("srcset");
            img.src = src + (src.includes("?") ? "&" : "?") + "r=" + pass;
            n++;
          }
        }
        return n;
      },
      { maxY: MAX_CSS_H, pass },
    );
    await page
      .waitForFunction(
        (maxY) =>
          [...document.images]
            .filter(
              (i) => i.getBoundingClientRect().top + window.scrollY <= maxY,
            )
            .every((i) => i.complete),
        MAX_CSS_H,
        { timeout: 20000 },
      )
      .catch(() => {});
    if (!broken) break;
  }
  const meta = await page.evaluate(() => {
    const h = document.documentElement.scrollHeight;
    let sticky = 0;
    for (const el of document.querySelectorAll(
      "header, nav, [class*=header], [class*=navbar]",
    )) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (
        (cs.position === "fixed" || cs.position === "sticky") &&
        r.top <= 1 &&
        r.height > 20 &&
        r.height < 220 &&
        r.width > window.innerWidth * 0.8
      )
        sticky = Math.max(sticky, Math.round(r.bottom));
    }
    const brokenImages = [...document.images].filter(
      (i) =>
        i.complete &&
        i.naturalWidth === 0 &&
        i.getBoundingClientRect().height > 40,
    ).length;
    return {
      cssHeight: h,
      stickyHeader: sticky,
      title: document.title,
      brokenImages,
    };
  });
  const clipH = Math.min(meta.cssHeight, MAX_CSS_H);
  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });
  const vw = DEVICES[kind].viewport.width;
  await page.screenshot({
    path: path.join(dir, `${kind}.jpg`),
    type: "jpeg",
    quality: 88,
    fullPage: true,
    clip: { x: 0, y: 0, width: vw, height: clipH },
  });
  await ctx.close();
  return {
    ...meta,
    clipCssHeight: clipH,
    dpr: DEVICES[kind].deviceScaleFactor,
    cssWidth: vw,
  };
}

for (const arg of process.argv.slice(2)) {
  const [slug, url] = arg.split("=");
  // merge with an earlier run so a single-device re-capture keeps the other entry
  const metaPath = path.join(OUT, slug, "meta.json");
  const result = fs.existsSync(metaPath)
    ? { ...JSON.parse(fs.readFileSync(metaPath, "utf8")), url }
    : { url };
  for (const kind of which === "both" ? ["mobile", "desktop"] : [which]) {
    for (let attempt = 1; attempt <= RETRIES; attempt++) {
      try {
        result[kind] = await capture(slug, url, kind);
        break;
      } catch (e) {
        result[kind] = { error: String(e).slice(0, 300), attempts: attempt };
      }
    }
  }
  fs.mkdirSync(path.join(OUT, slug), { recursive: true });
  fs.writeFileSync(
    path.join(OUT, slug, "meta.json"),
    JSON.stringify(result, null, 2),
  );
  console.log(slug, JSON.stringify(result));
}
await browser.close();
