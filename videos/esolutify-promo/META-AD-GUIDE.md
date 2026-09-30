# Running the Free Website Demo ad on Meta

This covers the deliverables in `renders/meta-ad/` and how to set them up in Ads Manager. The storyboard is in [`STORYBOARD-META-AD.md`](STORYBOARD-META-AD.md).

## Files

| File | Use |
| ---- | --- |
| `meta-ad-free-demo-9x16-21s.mp4` | **Reels** (Instagram + Facebook). 21s, 1080×1920, 30 fps, H.264 + AAC 192k |
| `meta-ad-free-demo-9x16-15s.mp4` | **Stories** (Instagram + Facebook). 15s cutdown of the same ad |
| `meta-ad-thumb.jpg` | Cover image (frame 50: the offer, the sticker and the scrolling site) |

Both files are H.264 yuv420p, tv range, tagged BT.709 (set in `remotion.config.ts`), so Meta's transcode keeps the dark palette intact.

Both cuts keep every word, the logo and the in-video button inside the area Meta leaves clear. Critical content sits in y 290–1160. The bottom third is imagery that sits under a dark gradient, so Meta's caption and **Apply Now** button land on dark.

## Ads Manager setup

1. **Objective:** Leads, with conversion location **Website**, pointing at `https://esolutify.com/free-demo`. Optimise for a *Lead* (or custom *Apply*) event fired when the 4-step application is submitted. Add the Meta Pixel and Conversions API event on that submit if it isn't there yet; the page currently loads Google Ads tags.
2. **Placements:** Manual. Choose Instagram Reels, Facebook Reels, Instagram Stories and Facebook Stories. Use *placement asset customisation* to put the 21s file on Reels and the 15s file on Stories. For Feed, make a 4:5 version rather than letting Meta crop this one.
3. **Locations:** Canada, United States, United Arab Emirates (where the offices are, and matching "Canada, USA or UAE" on the page).
4. **Advantage+ creative:** turn **off** the enhancements that change the video: music, text overlays/improvements, visual touch-ups, 3D animation and auto-crop. The music, layout and CTA are timed to each other.
5. **CTA button:** Apply Now. It matches the in-video button.
6. **URL parameters:** `utm_source=meta&utm_medium=paid_social&utm_campaign=free_demo&utm_content={{placement}}`

## Ad copy

The Reels caption truncates after the first line, so the offer comes first.

**Primary text** (test 2–3):

1. See your new website before you pay a dollar. Tell us about your business. If it's a fit, our team designs a working demo of your new site, free and with no obligation. Love it? Buy it outright or in installments. Don't? Walk away.
2. Free website demo: a working site, not a mockup. Your logo, your colours and copy written for your customers, on mobile and desktop. Apply in 2 minutes; from application to a demo you can click through in about a week.
3. See your new website before you pay a dollar. We take on 5 free demos a week in Canada, the USA and the UAE. Every site in this video is a demo our team built. Apply in 2 minutes.

**Headlines:**
- See your new site before you pay
- Free website demo. No obligation.
- A demo, not a mockup

**Description:** Personal review within one business day.

## Before you spend

- [ ] **Permission.** The ad shows five demos with real business names in their headers: Greer Smiles, Sutebel, Coldloop/New PC, Riel Build and National Aluminium/Ginco. Confirm each client is fine with appearing in paid ads. Riel Build and Ginco aren't among the three demos featured on /free-demo.
- [ ] **Landing page matches the ad.** /free-demo carries the same headline, "free" and "no obligation" wording, and the Apply form (Meta reviews landing-page consistency).
- [ ] **Rating still current.** "5.0 on Google · 500+ projects" is correct at each flight.
- [ ] **Riel Build demo CSS bug.** `esolutify.com/demo/rielbuild` → `site.css` line 285 has an extra `}` just before `/* ---- sections ---- */`. The browser drops the `.sec{padding:…}` rule, so every section on the live demo renders with no vertical padding. The ad shows it as designed. Delete that one `}` before viewers click through.

## Testing plan

Start with the 21s (Reels) and 15s (Stories) cuts in one ad set with the three primary texts. After about 3–5k impressions per ad, compare hook rate (3-second views ÷ impressions) and cost per application. The next creative to test is a showcase-led variant: an open with no text for 1 second, straight into the scrolling site. It scored second in the concept judging and can be cut from the same scenes.

## Re-rendering

```bash
cd videos/esolutify-promo
npx remotion render src/index.ts MetaAdFreeDemo   renders/meta-ad/meta-ad-free-demo-9x16-21s.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=192k
npx remotion render src/index.ts MetaAdFreeDemo15 renders/meta-ad/meta-ad-free-demo-9x16-15s.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=192k
npx remotion still  src/index.ts MetaAdFreeDemo   renders/meta-ad/meta-ad-thumb.jpg --frame=50 --image-format=jpeg --jpeg-quality=92
# safe-zone check: render MetaAdFreeDemo-SZ stills at any frame
```

To swap a site, capture it with `scripts/capture_sites.mjs`, set its crop in `scripts/crop_ad_sites.py`, and edit `src/ad/timeline.ts`.
