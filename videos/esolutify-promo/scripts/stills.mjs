// Render verification stills from the main composition in one bundle pass.
// Usage: node scripts/stills.mjs 100 250 400 ...   (frames)  -> out/check/fNNNN.png
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const frames = process.argv.slice(2).map(Number);
const comp = process.env.COMP ?? "EsolutifyPromo";
const browserExecutable =
  process.env.BROWSER ??
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({
  serveUrl,
  id: comp,
  browserExecutable,
});
for (const frame of frames) {
  const output = `out/check/f${String(frame).padStart(4, "0")}.png`;
  await renderStill({
    serveUrl,
    composition,
    frame,
    output,
    browserExecutable,
    scale: 0.5,
  });
  console.log(output);
}
