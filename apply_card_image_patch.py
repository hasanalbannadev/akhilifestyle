#!/usr/bin/env python3
"""Product card image: same square box on every card. Big photos shrink and small photos enlarge to fill the same box (never cropped,
proportions kept), rounded corners. Original file is not recompressed.
Usage:  python3 apply_card_blend_patch.py /path/to/website/src
NEW file (copy first): components/ui/CardImage.tsx.   Edits ONE file: components/product/ProductCard.tsx (.bak saved).
Works whether the card currently has the original image tag or the earlier crop version. Safe to run twice."""
import re
import shutil
import sys
from pathlib import Path

root = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
f = root / "components/product/ProductCard.tsx"
if not (root / "components/ui/CardImage.tsx").exists():
    raise SystemExit("First copy components/ui/CardImage.tsx into your project - nothing was changed")
s = f.read_text(encoding="utf-8")
if "<CardImage" in s:
    print("ProductCard.tsx: already done")
    raise SystemExit
NEW = "<CardImage key={img} src={img} alt={p.name} priority={priority} />"
m = (re.search(r"<FitImage key=\{img\} src=\{img\} alt=\{p\.name\} priority=\{priority\}\s*/>", s)
     or re.search(r'<SmartImage key=\{img\} src=\{img\} alt=\{p\.name\} priority=\{priority\}\s*className="[^"]*"\s*/>', s))
if not m:
    raise SystemExit("ProductCard.tsx: could not find the image tag - nothing was changed")
s = s.replace(m.group(0), NEW)
imp = 'import { CardImage } from "@/components/ui/CardImage";\n'
anchor = 'import { SmartImage } from "@/components/ui/SmartImage";\n'
if anchor in s:
    s = s.replace(anchor, anchor + imp, 1)
else:
    s = s.replace('"use client";\n', '"use client";\n' + imp, 1)
shutil.copy(f, str(f) + ".bak")
f.write_text(s, encoding="utf-8")
print("ProductCard.tsx: updated (backup ProductCard.tsx.bak)")
