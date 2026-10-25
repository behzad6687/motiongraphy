// Record a site scrolling, frame by frame, as an mp4 for a device mock-up.
// Scroll-driven effects (canvas films, reveals) are driven by the scroll
// position, so stepping the position per frame and screenshotting gives a
// smooth, deterministic recording that real-time capture can't in headless.
//
//   node scripts/record_scroll.mjs <slug> <device> <name> '<plan json>'
//     device: desktop (1440×900 @1x) | tablet (820×1180 @1x) | mobile (390×844 @2x)
//     plan:   [{"hold":15}, {"to":3990,"frames":180,"ease":"inOut"}, ...]
//             scroll starts at 0; "ease": linear | inOut | in | out | sine
//   env: CHROME, CCR_PROXY, CCR_SPKI (cloud sandbox proxy), SETTLE (ms, default 90)
// Writes public/stories/<slug>/<device>-<name>.mp4 (30 fps, H.264).
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [slug, device, name, planJson] = process.argv.slice(2);
const URLS = {
  downtowndentists: "https://esolutify.com/demo/downtowndentists/",
  pedinnails: "https://esolutify.com/demo/pedinnails/",
  samantha: "https://esolutify.com/demo/samantha/",
  crown: "https://esolutify.com/demo/crown/",
  rielbuild: "https://esolutify.com/demo/rielbuild/",
  gincoaluminium: "https://esolutify.com/demo/gincoaluminium/",
  hb: "https://esolutify.com/demo/hb",
  newpc: "https://esolutify.com/demo/pc/",
  nhfclinics: "https://www.nhfclinics.com/",
};
const url = process.env.URL ?? URLS[slug];
const plan = JSON.parse(planJson);
const SETTLE = Number(process.env.SETTLE ?? 90);
const DEVICES = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  tablet: {
    viewport: { width: 820, height: 1180 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  },
  mobile: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  },
};
const EASE = {
  linear: (t) => t,
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  in: (t) => t * t * t,
  out: (t) => 1 - Math.pow(1 - t, 3),
  sine: (t) => (1 - Math.cos(Math.PI * t)) / 2,
};

// scroll position for every output frame
const ys = [];
let y = 0;
for (const step of plan) {
  if (step.hold) for (let i = 0; i < step.hold; i++) ys.push(y);
  else {
    const e = EASE[step.ease ?? "inOut"];
    for (let i = 1; i <= step.frames; i++)
      ys.push(Math.round(y + (step.to - y) * e(i / step.frames)));
    y = step.to;
  }
}

const args = ["--no-sandbox", "--disable-http2", "--disable-quic"];
if (process.env.CCR_SPKI)
  args.push(`--ignore-certificate-errors-spki-list=${process.env.CCR_SPKI}`);
const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? undefined,
  args,
  proxy: process.env.CCR_PROXY ? { server: process.env.CCR_PROXY } : undefined,
});
const ctx = await browser.newContext(DEVICES[device]);
let page = await ctx.newPage();
const passChallenge = async () => {
  for (let i = 0; i < 24; i++) {
    await page.waitForTimeout(2000);
    const t = await page.title().catch(() => "One moment");
    if (t && !/One moment/i.test(t)) return;
  }
  throw new Error("stuck on the bot-check page");
};
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
await passChallenge();
// a fresh page now that the bot-check cookie is set: the intro plays from the top
const fresh = await ctx.newPage();
await page.close();
page = fresh;
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
await passChallenge();
await page.waitForLoadState("networkidle", { timeout: 45000 }).catch(() => {});
await page.addStyleTag({
  content: `html{scroll-behavior:auto!important}
    [id*="cookie" i],[class*="cookie" i],[id*="consent" i],[class*="consent" i],
    iframe[src*="chat" i],[class*="tawk" i],[id*="tawk" i],.grecaptcha-badge{display:none!important}`,
});
// preload: walk the page once so images and film frames are cached
const maxY = Math.max(...ys);
await page.evaluate(async (maxY) => {
  for (let y = 0; y <= maxY + 900; y += 300) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo(0, 0);
}, maxY);
await page.waitForTimeout(2500);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rec-"));
for (let i = 0; i < ys.length; i++) {
  await page.evaluate(
    (y) =>
      new Promise((r) => {
        window.scrollTo(0, y);
        requestAnimationFrame(() => requestAnimationFrame(r));
      }),
    ys[i],
  );
  if (SETTLE) await page.waitForTimeout(SETTLE);
  await page.screenshot({
    path: path.join(tmp, `f${String(i).padStart(4, "0")}.jpg`),
    type: "jpeg",
    quality: 90,
  });
}
await browser.close();

const outDir = path.resolve("public/stories", slug);
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${device}-${name}.mp4`);
execFileSync(
  "npx",
  [
    "remotion",
    "ffmpeg",
    "-y",
    "-loglevel",
    "error",
    "-framerate",
    "30",
    "-i",
    path.join(tmp, "f%04d.jpg"),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "18",
    "-vf",
    "scale=trunc(iw/2)*2:trunc(ih/2)*2",
    out,
  ],
  { stdio: "inherit" },
);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${out}: ${ys.length} frames, scroll 0→${maxY}`);
