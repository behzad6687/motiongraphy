"""Compose the visual storyboard sheet (storyboard.png) from rendered stills.

    node scripts/stills.mjs 130 380 540 740 1000 1250 1460 1600 1842 1980
    python3 scripts/storyboard_sheet.py

Needs: pip install pillow fonttools brotli
"""

from io import BytesIO
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent

SCENES = [
    (130, "01", "The enquiry", "0:00", "A 9:42 PM enquiry arrives. “Every lead that waits… is a lead you lose.”"),
    (380, "02", "Same lead. Two outcomes.", "0:05", "14 h 33 min and lost, vs 5 seconds and booked. The site's own proof."),
    (540, "03", "The promise", "0:14", "Logo on the music drop. “We don’t just get you leads. We convert them.”"),
    (740, "04", "How it works", "0:19", "Capture · Converse · Convert, drawn as one gold circuit."),
    (1000, "05", "See it in action", "0:26", "The AI agent turns a missed call into a booked appointment in seconds."),
    (1250, "06", "One team", "0:34", "Flagship AI automation plus ads, SEO, social, web, design, video and apps."),
    (1460, "07", "Numbers that speak", "0:43", "500+ projects · 15+ years · 4.8x ROAS · 98% satisfaction · 5.0 on Google."),
    (1600, "08", "Websites that convert", "0:50", "Real client sites scroll in angled browser frames."),
    (1842, "09", "Every sector. Four offices.", "0:55", "16 sectors, then Toronto · Montréal · Los Angeles · Dubai."),
    (1980, "10", "Book the call", "1:02", "“One system. Every lead answered.” Book a free strategy call."),
]

BG = (10, 10, 10)
TEXT = (240, 237, 232)
MUTED = (163, 158, 150)
GOLD = (220, 174, 85)


def font(name, size, weight):
    """Instance the variable woff2 at a weight and load it into Pillow."""
    tt = TTFont(ROOT / "public" / "fonts" / name)
    tt.flavor = None
    if "fvar" in tt:
        from fontTools.varLib.instancer import instantiateVariableFont

        tt = instantiateVariableFont(tt, {"wght": weight})
    buf = BytesIO()
    tt.save(buf)
    buf.seek(0)
    return ImageFont.truetype(buf, size)


def main():
    display = font("RedHatDisplay-Variable.woff2", 34, 800)
    title = font("RedHatDisplay-Variable.woff2", 64, 800)
    body = font("DMSans-Variable.woff2", 24, 400)
    small = font("DMSans-Variable.woff2", 22, 600)

    tile_w, tile_h = 960, 540
    cols, gap, pad = 2, 40, 80
    cap_h = 118
    rows = (len(SCENES) + cols - 1) // cols
    W = pad * 2 + cols * tile_w + (cols - 1) * gap
    H = 260 + rows * (tile_h + cap_h + gap) + pad - gap
    sheet = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(sheet)

    d.text((pad, 70), "eSolutify — “Every Lead Answered”", font=title, fill=TEXT)
    d.text(
        (pad, 160),
        "Storyboard · 70 s · 1920×1080 · 10 scenes · original 120 BPM score, drop on the logo at 0:14",
        font=body,
        fill=MUTED,
    )
    d.rectangle((pad, 215, pad + 120, 218), fill=GOLD)

    for i, (frame, num, name, t, desc) in enumerate(SCENES):
        c, r = i % cols, i // cols
        x = pad + c * (tile_w + gap)
        y = 260 + r * (tile_h + cap_h + gap)
        im = Image.open(ROOT / "out" / "check" / f"f{frame:04d}.png").convert("RGB").resize((tile_w, tile_h))
        sheet.paste(im, (x, y))
        d.rectangle((x, y, x + tile_w - 1, y + tile_h - 1), outline=(40, 40, 40))
        d.text((x, y + tile_h + 18), num, font=display, fill=GOLD)
        d.text((x + 60, y + tile_h + 18), name, font=display, fill=TEXT)
        tw = d.textlength(t, font=small)
        d.text((x + tile_w - tw, y + tile_h + 26), t, font=small, fill=MUTED)
        d.text((x, y + tile_h + 68), desc, font=body, fill=MUTED)

    out = ROOT / "storyboard.png"
    sheet.save(out, optimize=True)
    print(out, sheet.size)


if __name__ == "__main__":
    main()
