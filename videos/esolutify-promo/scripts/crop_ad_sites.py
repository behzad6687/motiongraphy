"""Crop the full-page captures to the working copies the Meta ad scrolls.

    python3 scripts/crop_ad_sites.py

Keeps full width, never upscales. The crop heights (css px) double as content
guards: nothing below them (client prices, stats chapters) can ever render,
and every layer stays under Chromium's 16,384 px texture limit.
Writes public/sites/<slug>/ad-mobile.jpg and ad-desktop.jpg.
"""

import json
from pathlib import Path

from PIL import Image

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent / "public" / "sites"

# slug: (mobile css height, desktop css height)
CROPS = {
    "greersmiles": (3100, 2700),
    "sutebel": (2400, 2000),
    "newpc": (2900, 1800),
    "rielbuild": (4800, 1800),
    "gincoaluminium": (1688, 1838),
}
DPR = {"mobile": 2.5, "desktop": 1.25}

for slug, (m_css, d_css) in CROPS.items():
    for device, css in (("mobile", m_css), ("desktop", d_css)):
        src = ROOT / slug / f"{device}.jpg"
        im = Image.open(src).convert("RGB")
        h = min(im.height, round(css * DPR[device]))
        out = ROOT / slug / f"ad-{device}.jpg"
        im.crop((0, 0, im.width, h)).save(out, quality=88, optimize=True, progressive=True)
        print(f"{out.relative_to(ROOT.parent.parent)} {im.width}x{h} ({css} css)")
