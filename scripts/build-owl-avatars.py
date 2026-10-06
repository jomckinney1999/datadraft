"""
Cut the owl sprite (public/avatars/nfl-team-owls.jpg, 8 x 4 teams) into one
small image per team, plus the greyscale free-agent face, so a page loads
the one owl it shows instead of all 32 (the sprite is 423 KB and the locker
chip in the nav draws a 28px avatar on every page).

    python scripts/build-owl-avatars.py

Writes public/avatars/owls/<abbr>.webp and free-agent.webp. The team order
and the free-agent crop are the ones components/team-owl-avatar.tsx and
lib/nfl-team-avatars.ts use; change one, change the other. Rerun after
replacing the sprite.
"""

import os
import re
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPRITE = os.path.join(ROOT, "public", "avatars", "nfl-team-owls.jpg")
OUT = os.path.join(ROOT, "public", "avatars", "owls")
COLS, ROWS = 8, 4

# The team order, read from lib/nfl-team-avatars.ts so it can't drift.
src = open(os.path.join(ROOT, "lib", "nfl-team-avatars.ts"), encoding="utf-8").read()
order_block = re.search(r"NFL_TEAM_ORDER = \[(.*?)\]", src, re.S).group(1)
ORDER = re.findall(r'"([A-Z]{2,3})"', order_block)
assert len(ORDER) == COLS * ROWS, ORDER

im = Image.open(SPRITE).convert("RGB")
W, H = im.size
cw, ch = W / COLS, H / ROWS
os.makedirs(OUT, exist_ok=True)


def cell(index):
    col, row = index % COLS, index // COLS
    box = (round(col * cw), round(row * ch), round((col + 1) * cw), round((row + 1) * ch))
    return im.crop(box), box


total = 0
for i, abbr in enumerate(ORDER):
    img, _ = cell(i)
    path = os.path.join(OUT, f"{abbr.lower()}.webp")
    img.save(path, "WEBP", quality=82, method=6)
    total += os.path.getsize(path)

# The free agent: cell 0's face, a 100 x 100 square from x 14, y 58 of the
# cell (below the cap's logo, above the number), in greyscale.
first, (x0, y0, _, _) = cell(0)
face = im.crop((x0 + 14, y0 + 58, x0 + 114, y0 + 158))
face = ImageOps.grayscale(face).convert("RGB")
face.save(os.path.join(OUT, "free-agent.webp"), "WEBP", quality=82, method=6)

print(f"{len(ORDER)} team owls, {total // 1024} KB together; free agent {os.path.getsize(os.path.join(OUT, 'free-agent.webp'))} bytes")
