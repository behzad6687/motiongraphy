// Record a site scrolling, frame by frame, as an mp4 for a device mock-up.
// Scroll-driven effects (canvas films, reveals) are driven by the scroll
// position, so stepping the position per frame and screenshotting gives a
// smooth, deterministic recording that real-time capture can't in headless.
//
//   node scripts/record_scroll.mjs <slug> <device> <name> '<plan json>'
//     device: desktop (1440×900 @1x) | tablet (820×1180 @1x) | mobile (390×844 @2x)
//     plan:   [{"hold":15}, {"to":3990,"frames":180,"ease":"inOut"}, ...]
//             scroll starts at 0; "ease": linear | inOut | in | out | sine
//             {"toSel":"#tryon","offset":-40,"frames":60} scrolls to an element
//             {"click":"[data-opt=shape] button:nth-child(2)","hold":24,"every":2}
//               taps it, then records `hold` frames (one screenshot per
//               `every` frames, so the page's own animations keep pace)
//   Taps are logged to <device>-<name>.json ({frame, x, y} in css px) so a
//   finger can be drawn over them.
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
await page.evaluate(async () => {
  for (let y = 0; y <= document.documentElement.scrollHeight; y += 300) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 90));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(2500);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rec-"));
let n = 0;
let y = 0;
let maxY = 0;
const taps = [];
const shot = async (copies = 1) => {
  const f = path.join(tmp, `f${String(n).padStart(4, "0")}.jpg`);
  await page.screenshot({ path: f, type: "jpeg", quality: 90 });
  n++;
  for (let i = 1; i < copies; i++) {
    fs.copyFileSync(f, path.join(tmp, `f${String(n).padStart(4, "0")}.jpg`));
    n++;
  }
};
const scrollTo = async (yy) => {
  await page.evaluate(
    (yy) =>
      new Promise((r) => {
        window.scrollTo(0, yy);
        requestAnimationFrame(() => requestAnimationFrame(r));
      }),
    yy,
  );
  if (SETTLE) await page.waitForTimeout(SETTLE);
};
const glide = async (to, frames, ease) => {
  const e = EASE[ease ?? "inOut"];
  const y0 = y;
  for (let i = 1; i <= frames; i++) {
    await scrollTo(Math.round(y0 + (to - y0) * e(i / frames)));
    await shot();
  }
  y = to;
  maxY = Math.max(maxY, y);
};
for (const step of plan) {
  if (step.hold && !step.click) {
    for (let i = 0; i < step.hold; i++) await shot();
  } else if (step.to !== undefined) {
    await glide(step.to, step.frames, step.ease);
  } else if (step.toSel) {
    const top = await page.evaluate(
      (sel) =>
        document.querySelector(sel).getBoundingClientRect().top +
        window.scrollY,
      step.toSel,
    );
    await glide(Math.round(top + (step.offset ?? 0)), step.frames, step.ease);
  } else if (step.click) {
    const el = page.locator(step.click).first();
    const box = await el.boundingBox();
    taps.push({
      frame: n,
      x: Math.round(box.x + box.width / 2),
      y: Math.round(box.y + box.height / 2),
    });
    await el.dispatchEvent("click");
    const every = step.every ?? 2;
    for (let i = 0; i < (step.hold ?? 20); i += every)
      await shot(Math.min(every, (step.hold ?? 20) - i));
    // the page may scroll itself (e.g. focus); keep our idea of y honest
    y = await page.evaluate(() => Math.round(window.scrollY));
  }
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
fs.writeFileSync(
  out.replace(/\.mp4$/, ".json"),
  JSON.stringify({ frames: n, taps }, null, 1),
);
console.log(`${out}: ${n} frames, scroll 0→${maxY}, ${taps.length} taps`);
