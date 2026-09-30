---
format: 1080x1920
fps: 30
duration: 21s (Reels) · 15s cutdown (Stories)
message: "See your new website before you pay a dollar. A working demo, not a mockup, built by the team behind these sites."
arc: Offer (0s) → Proof it's real (mobile + desktop scroll) → Montage on the drop → Your brand → The process → Apply
audience: Owners of service businesses in Canada, the USA and the UAE who need a new website
placements: Meta Reels + Stories (9:16)
music: original 120 BPM track (scripts/gen_audio.py ad …), drop at 6.0s on the montage
source: https://esolutify.com/free-demo (captured 2026-09-30) + live demo sites
compositions: MetaAdFreeDemo (21s) · MetaAdFreeDemo15 (15s) · MetaAdFreeDemo-SZ (safe-zone review)
---

# eSolutify: Free Website Demo · 9:16 Meta ad

**This ad tells business owners they can see a working version of their new website before paying anything. It proves that with real sites eSolutify built, scrolled on a phone and in a browser.**

Chosen by a judged panel of three concepts: offer-led 49.5/60, objection-led 48, showcase-led 46. The build uses the offer-led structure with grafts from the other two:

- One continuous hero phone that docks beside a browser and becomes the centre of the phone wall.
- Scrolling that moves like a real thumb, with velocity blur.
- The real demo URLs in the browser bar.
- The "We build websites like this." line.

## Safe zones (every frame)

- Critical copy stays inside **y 290–1160, x 65–960**. That's inside Reels-safe (top 270 / bottom 670 clear, right icon column clear) and Stories-safe (top and bottom 250 clear).
- Below y 1250 there's imagery only: phone lower halves and the sunk phone wall. A dark gradient from y 1480 means Meta's caption and **Apply Now** button land on dark.
- The in-video button says **Apply now**, the same words as Meta's CTA, and a text-free chevron points down to it.
- Review with the `MetaAdFreeDemo-SZ` composition (red = covered by Reels UI, amber = Stories lines, green = text rails).

## Scenes (21s)

| # | Time | On screen | Showcase | Why |
| - | ---- | --------- | -------- | --- |
| 1 | 0–2s | **See your new website / before you pay a dollar.** + gold "FREE · NO OBLIGATION" sticker | Phone rises with Greer Smiles (dental) mobile; one thumb flick with a touch dot | The offer is readable on frame 0 |
| 2 | 2–4s | **A demo, not a mockup.** / "A working site you can click through." | Two more flicks down the real page; sticky header stays pinned, scrollbar moves | Answers "is it real?" |
| 3 | 4–6s | Chip: "Family dental clinic · demo" | Browser `esolutify.com/demo/greersmiles` glides to the cosmetic-services accordion; the phone docks at its corner and reads the same section | Mobile **and** desktop, the same site |
| 4 | 6–10s | **We build websites like this.** + a sector chip that flips on each beat | On the drop the phone re-centres; the page swaps on every 2 beats: Sutebel (luxury fashion) → New PC (custom PC studio) → Riel Build (renovation) → Ginco (façade contractor, UAE). A ghost browser behind shows each site's desktop view | Range across industries, cut on the beat |
| 5 | 10–12s | **Your brand, not a theme.** / "Your logo · your colours · your customers" | Wall of 5 phones, each still scrolling its own site | Every demo looks like its own brand |
| 6 | 12–16s | **Your demo in about a week.** 1 Apply in 2 minutes · 2 A 10-minute call · 3 We build your demo (usually within 5–7 days) · 4 Love it? Buy it. Don't? Walk away. | Wall sinks into the bottom UI zone as texture | Removes the risk; the process in 4 beats |
| 7 | 16–21s | Logo → **Apply for your free demo** → [Apply now →] → esolutify.com/free-demo → "We take on 5 free demos a week." → ★ 5.0 on Google · 500+ projects → ⌄ | Sunk wall drifts; tap ripple presses the button | One action, same words as Meta's button |

**15s cutdown (`MetaAdFreeDemo15`):** scenes 1–4 unchanged (0–10s). The CTA starts at 10s, the wall and process are dropped, and the trust line becomes "Your demo in about a week."

## Truth guards

- Every claim is verbatim from esolutify.com/free-demo: a free working demo, no obligation, pay in full or in installments, 2-minute application, a 10-minute call, usually 5–7 days, 5 free demos a week, 5.0 on Google (27 reviews), 500+ projects.
- The captures are cropped (`scripts/crop_ad_sites.py`) so no client prices or stats sections can appear.
- KH Electric is left out: it's a live client site, not a demo, and would contradict "A demo, not a mockup."
