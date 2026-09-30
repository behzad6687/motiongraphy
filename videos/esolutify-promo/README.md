# eSolutify — "Every Lead Answered"

A 70-second, 1920×1080 motion-graphics explainer for [esolutify.com](https://esolutify.com),
built in [Remotion](https://remotion.dev). It introduces the core idea: eSolutify doesn't stop at
the lead. It builds the AI system that answers, books and follows up every enquiry, then feeds it
with ads, SEO and websites.

- **Video:** [`renders/esolutify-promo.mp4`](renders/esolutify-promo.mp4) (70 s, 1920×1080, H.264 + AAC) · poster: [`renders/poster.jpg`](renders/poster.jpg)
- **Storyboard:** [`STORYBOARD.md`](STORYBOARD.md) (10 scenes, on-screen copy, shot sequences, audio cues, optional VO script) · visual sheet: [`storyboard.png`](storyboard.png)
- **Brand:** colours, fonts and logo captured from esolutify.com (see `src/theme.ts`)
- **Audio:** an original 120 BPM score and SFX kit synthesised in code (`scripts/gen_audio.py`), with no licensed samples

## Scenes

| # | Scene | Time |
| - | ----- | ---- |
| 1 | The enquiry: *"Every lead that waits… is a lead you lose."* | 0:00 |
| 2 | Same lead, two outcomes: 14 h 33 min vs 5 seconds | 0:05 |
| 3 | Logo reveal on the drop: *"We don't just get you leads. We convert them."* | 0:14 |
| 4 | How it works: Capture → Converse → Convert | 0:19 |
| 5 | See it in action: the AI agent books a missed call | 0:26 |
| 6 | One team: flagship AI automation + 7 services + free demo | 0:34 |
| 7 | Numbers that speak: 500+ · 15+ · 4.8x · 98% · 5.0★ | 0:43 |
| 8 | Websites that convert: real client sites | 0:50 |
| 9 | Every sector · four offices | 0:55 |
| 10 | CTA: *Book a free strategy call* · esolutify.com | 1:02 |

## Commands

```bash
npm i

# live preview (every scene is also its own composition under "Scenes")
npx remotion studio

# final render
npx remotion render src/index.ts EsolutifyPromo out/esolutify-promo.mp4 --codec=h264 --crf=18

# regenerate the score + SFX (needs: pip install numpy scipy)
python3 scripts/gen_audio.py

# verification stills → out/check/fNNNN.png (half size)
node scripts/stills.mjs 100 400 900
```

In sandboxes without a downloadable Chrome, pass
`--browser-executable=<path to chrome-headless-shell>` to `render`. For `stills.mjs`, set `BROWSER=<path>`.

## Layout

```
src/
  theme.ts           brand tokens, easings, springs (single source of truth)
  fonts.ts           Red Hat Display + DM Sans (local variable woff2)
  Main.tsx           TransitionSeries timeline, music, transition SFX
  components/        Stage (mesh → content → grade → grain → vignette), Motion, Icons, Sfx
  scenes/S01…S10     one file per storyboard frame
public/
  brand/ fonts/ portfolio/ offices/ audio/
scripts/
  gen_audio.py       deterministic music + SFX synthesis
  stills.mjs         batch still renderer for frame inspection
```

## Editing tips

- To change copy, edit the scene file. Timings are in frames at 30 fps, and one beat is 15 frames.
- Scene cuts sit on the music's bar grid. If you change a scene's `durationInFrames` in
  `Main.tsx`, keep the total at 2100 frames or regenerate the score with a new `TOTAL`.
- Portfolio screenshots are the top 2600 px of each site's full-page capture (`public/portfolio`).
