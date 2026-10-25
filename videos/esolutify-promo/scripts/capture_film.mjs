// Mobile capture for sites whose hero is a scroll-pinned "film" intro (with a
// "Skip intro" button). A plain full-page screenshot turns the pinned film into
// a long empty band, so this stitches: the first film frame (one viewport) +
// the page after the film, from where "Skip intro" lands.
//   node scripts/capture_film.mjs <slug>=<url> [...]   (env: MAX_CSS_H, CHROME, CCR_PROXY, CCR_SPKI)
// Writes public/sites/<slug>/mobile.jpg and merges "mobile" into meta.json
// (clipCssHeight = stitched height). Fixed bars are hidden in the stitched
// part; use sticky 0 for these captures (the hero frame's header is
// transparent over the film, so pinning it would look wrong).
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const OUT = path.resolve("public/sites");
const MAX_CSS_H = Number(process.env.MAX_CSS_H ?? 6400);
const args = ["--no-sandbox", "--disable-http2", "--disable-quic"];
if (process.env.CCR_SPKI)
  args.push(`--ignore-certificate-errors-spki-list=${process.env.CCR_SPKI}`);
const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? undefined,
  args,
  proxy: process.env.CCR_PROXY ? { server: process.env.CCR_PROXY } : undefined,
});
const DPR = 2.5;
const HIDE_CSS = `
  html { scroll-behavior: auto !important; }
  [id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i],
  [class*="chat-widget" i], [id*="chat-widget" i], [class*="ask-sol" i], [id*="ask-sol" i],
  iframe[src*="chat" i], [class*="tawk" i], [id*="tawk" i], .grecaptcha-badge { display: none !important; }
`;

async function capture(slug, url) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: DPR,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  });
  const page = await ctx.newPage();
  // the host's bot check serves a "One moment" page first; wait it out, then
  // reload so every subresource is the real one
  const passChallenge = async () => {
    for (let i = 0; i < 24; i++) {
      await page.waitForTimeout(2500);
      const t = await page.title().catch(() => "One moment");
      if (t && !/One moment/i.test(t)) return;
    }
    throw new Error("stuck on the bot-check page");
  };
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await passChallenge();
  await page.reload({ waitUntil: "domcontentloaded", timeout: 90000 });
  await passChallenge();
  await page
    .waitForLoadState("networkidle", { timeout: 45000 })
    .catch(() => {});
  await page.addStyleTag({ content: HIDE_CSS });
  await page.waitForTimeout(2500);
  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "film-"));
  // 1) the film's first frame, exactly as a visitor lands
  await page.screenshot({ path: path.join(tmp, "hero.png") });
  // 2) skip the film; where it lands is where the real page begins
  const skip = page.getByText(/skip intro/i).first();
  await skip.click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const start = await page.evaluate(() => Math.round(window.scrollY));
  // walk the rest so lazy images load and reveal animations fire
  await page.evaluate(async (start) => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = start; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
    }
    window.scrollTo(0, start);
  }, start);
  await page.waitForTimeout(1500);
  await page
    .waitForFunction(
      () => [...document.images].every((i) => i.complete),
      null,
      {
        timeout: 20000,
      },
    )
    .catch(() => {});
  const info = await page.evaluate(() => {
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
        r.width > window.innerWidth * 0.8 &&
        cs.visibility !== "hidden" &&
        Number(cs.opacity) > 0.5
      )
        sticky = Math.max(sticky, Math.round(r.bottom));
    }
    return {
      h: document.documentElement.scrollHeight,
      title: document.title,
      sticky,
    };
  });
  // fixed bars (header, bottom "Book" bar) would be stamped wherever the
  // viewport sat during the full-page shot: hide them for that shot
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *")) {
      const p = getComputedStyle(el).position;
      if (p === "fixed" || p === "sticky") el.style.visibility = "hidden";
    }
  });
  if (info.h < 3000) throw new Error(`page too short (${info.h} css)`);
  // no film (nothing to skip): the page itself, no stitched hero frame
  const hero = start > 50 ? 844 : 0;
  const restH = Math.min(info.h - start, MAX_CSS_H - hero);
  await page.screenshot({
    path: path.join(tmp, "rest.png"),
    fullPage: true,
    clip: { x: 0, y: start, width: 390, height: restH },
  });
  await ctx.close();
  if (!hero)
    fs.copyFileSync(path.join(tmp, "rest.png"), path.join(tmp, "only.png"));
  execFileSync(
    "python3",
    hero
      ? [
          "-c",
          `import sys
from PIL import Image
a=Image.open(sys.argv[1]).convert("RGB"); b=Image.open(sys.argv[2]).convert("RGB")
o=Image.new("RGB",(a.width,a.height+b.height)); o.paste(a,(0,0)); o.paste(b,(0,a.height))
o.save(sys.argv[3],quality=88)`,
          path.join(tmp, "hero.png"),
          path.join(tmp, "rest.png"),
          path.join(dir, "mobile.jpg"),
        ]
      : [
          "-c",
          "import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert('RGB').save(sys.argv[2], quality=88)",
          path.join(tmp, "only.png"),
          path.join(dir, "mobile.jpg"),
        ],
  );
  fs.rmSync(tmp, { recursive: true, force: true });
  return {
    cssHeight: info.h,
    stickyHeader: info.sticky,
    title: info.title,
    clipCssHeight: hero + restH,
    dpr: DPR,
    cssWidth: 390,
    composite: hero > 0,
    note: hero
      ? `film hero frame (0-844) + page after "Skip intro" (source y=${start}-${start + restH})`
      : "no film intro: plain page capture with fixed bars hidden",
  };
}

for (const arg of process.argv.slice(2)) {
  const [slug, url] = arg.split(/=(.*)/s);
  const metaPath = path.join(OUT, slug, "meta.json");
  const result = fs.existsSync(metaPath)
    ? { ...JSON.parse(fs.readFileSync(metaPath, "utf8")), url }
    : { url };
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      result.mobile = await capture(slug, url);
      break;
    } catch (e) {
      result.mobile = { error: String(e).slice(0, 300), attempts: attempt };
    }
  }
  fs.writeFileSync(metaPath, JSON.stringify(result, null, 2));
  console.log(slug, JSON.stringify(result.mobile));
}
await browser.close();
