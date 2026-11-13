#!/usr/bin/env python3
"""Update 5 - website edits WITHOUT replacing your files (so anything you changed yourself stays).
Usage:   python3 apply_update5_web_patch.py /path/to/website/src          (the 'src' folder of the customer website)
Edits (one or two lines each): types/index.ts, lib/errors.ts, app/checkout/page.tsx,
       components/product/ProductCard.tsx, components/cart/CartItemRow.tsx, app/account/wishlist/page.tsx
A backup <file>.bak is saved before each change. Safe to run twice. If an expected place is not found it changes NOTHING."""
import shutil
import sys
from pathlib import Path

root = Path(sys.argv[1] if len(sys.argv) > 1 else ".")


def once(s, old, new, label):
    if s.count(old) != 1:
        raise SystemExit(f"{label}: could not find the expected place (found {s.count(old)}x) - nothing was changed")
    return s.replace(old, new)


def types_ts(s):
    if "banner_only" in s:
        return s
    s = once(s, "id: number; code: string; label: string; title: string | null; text: string | null; image: string | null;",
             "id: number; code: string | null; label: string; title: string | null; text: string | null; image: string | null;",
             "types/index.ts (code)")
    return once(s, "button_text: string | null; link: string | null; seconds: number; min_subtotal: number;",
                "button_text: string | null; link: string | null; seconds: number; min_subtotal: number; banner_only?: boolean;",
                "types/index.ts (banner_only)")


def errors_ts(s):
    if "does not work with this payment method" in s:
        return s
    return once(s, '  [/already used this coupon/i, "আপনি এই কুপন আগেই ব্যবহার করেছেন"],\n',
                '  [/already used this coupon/i, "আপনি এই কুপন আগেই ব্যবহার করেছেন"],\n'
                '  [/does not work with this payment method/i, "এই পেমেন্ট মেথডে কুপন চলবে না। কুপন চাইলে অন্য পেমেন্ট মেথড বেছে নিন"],\n',
                "lib/errors.ts")


def checkout_tsx(s):
    if "errorMessage(new Error(s.coupon_error))" in s:
        return s
    return once(s, 'toast(s.coupon_error, "error");', 'toast(errorMessage(new Error(s.coupon_error)), "error");', "app/checkout/page.tsx")

def card_tsx(s):
    if "FitImage" in s:
        return s
    import re
    m = re.search(r'<SmartImage key=\{img\} src=\{img\} alt=\{p\.name\} priority=\{priority\}\s*className="[^"]*" />', s)
    if not m:
        raise SystemExit("components/product/ProductCard.tsx: could not find the image tag - nothing was changed")
    s = s.replace(m.group(0), '<span className="block transition-transform duration-300 group-hover:scale-105"><FitImage key={img} src={img} alt={p.name} priority={priority} /></span>')
    if 'import { SmartImage }' in s:
        s = s.replace('import { SmartImage }', 'import { FitImage } from "@/components/ui/FitImage";\nimport { SmartImage }', 1)
    else:
        s = s.replace('"use client";\n', '"use client";\nimport { FitImage } from "@/components/ui/FitImage";\n', 1)
    return s


def cart_tsx(s):
    if 'alt={line.name} className="h-full w-full object-contain"' in s:
        return s
    return once(s, 'alt={line.name} className="h-full w-full object-cover"', 'alt={line.name} className="h-full w-full object-contain"',
                "components/cart/CartItemRow.tsx")


def wish_tsx(s):
    if 'alt={p.name} className="h-full w-full object-contain"' in s:
        return s
    return once(s, 'alt={p.name} className="h-full w-full object-cover"', 'alt={p.name} className="h-full w-full object-contain"',
                "app/account/wishlist/page.tsx")


FILES = (("types/index.ts", types_ts), ("lib/errors.ts", errors_ts), ("app/checkout/page.tsx", checkout_tsx),
         ("components/product/ProductCard.tsx", card_tsx), ("components/cart/CartItemRow.tsx", cart_tsx),
         ("app/account/wishlist/page.tsx", wish_tsx))
jobs = {}
for rel, fn in FILES:
    p = root / rel
    if not p.exists():
        raise SystemExit(f"{p} not found - give the path of the website 'src' folder")
    old = p.read_text(encoding="utf-8")
    jobs[p] = (old, fn(old))
for p, (old, new) in jobs.items():
    if new == old:
        print(f"{p.name}: already done")
    else:
        shutil.copy(p, str(p) + ".bak")
        p.write_text(new, encoding="utf-8")
        print(f"{p.name}: updated (backup {p.name}.bak)")
print("DONE")
