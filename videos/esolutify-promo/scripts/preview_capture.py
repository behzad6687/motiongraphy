"""Contact sheet of a site capture for visual QA.

    python3 scripts/preview_capture.py <slug> [out.jpg]

Splits the tall mobile capture into columns and appends the desktop capture,
so the whole page can be checked in one image (missing styles, blank lazy
sections, popups, cookie bars, unrevealed scroll animations).
"""

import sys
from pathlib import Path

from PIL import Image

slug = sys.argv[1]
root = Path(__file__).resolve().parent.parent / "public" / "sites" / slug
out = Path(sys.argv[2]) if len(sys.argv) > 2 else root / "preview.jpg"
tiles = []
for kind, width, cols in (("mobile", 260, 5), ("desktop", 560, 3)):
    p = root / f"{kind}.jpg"
    if not p.exists():
        continue
    im = Image.open(p).convert("RGB")
    t = im.resize((width, int(im.height * width / im.width)))
    step = -(-t.height // cols)
    tiles += [t.crop((0, k * step, width, min(t.height, (k + 1) * step))) for k in range(cols)]
h = max(t.height for t in tiles)
sheet = Image.new("RGB", (sum(t.width + 8 for t in tiles), h), "white")
x = 0
for t in tiles:
    sheet.paste(t, (x, 0))
    x += t.width + 8
sheet.save(out, quality=78)
print(out, sheet.size)
