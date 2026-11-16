#!/usr/bin/env python3
"""Website: use the SEO typed in the admin panel (title, description, keywords, hide-from-Google) on every page.
Usage: python3 apply_seo_web_patch.py /path/to/website/src     (safe to run twice; each file gets a .bak; a page whose
expected line is not found is skipped and reported - nothing else changes)

NEW files (copied by you): lib/api/seo.ts.   REPLACE: app/sitemap.ts.
This script: appends applySeo()/seoFor() to lib/seo.ts and wraps generateMetadata / metadata in the pages below."""
import re
import shutil
import sys
from pathlib import Path

root = Path(sys.argv[1] if len(sys.argv) > 1 else "src")

HELPERS = '''

// ---- অ্যাডমিন প্যানেলের SEO (title / description / keywords / noindex) মেটাডাটায় বসায়
import { seoApi, type SeoEntry } from "@/lib/api/seo";

export async function seoFor(kind: "pages" | "categories" | "products", key: string): Promise<SeoEntry | undefined> {
  const all = await seoApi.all();
  return all[kind]?.[key];
}

export function applySeo(m: Metadata, o?: SeoEntry): Metadata {
  if (!o) return m;
  const out: Metadata = { ...m };
  if (o.title) {
    out.title = o.title;
    out.openGraph = { ...(m.openGraph ?? {}), title: o.title } as Metadata["openGraph"];
    out.twitter = { ...(m.twitter ?? {}), title: o.title } as Metadata["twitter"];
  }
  if (o.description) {
    out.description = o.description;
    out.openGraph = { ...(out.openGraph ?? {}), description: o.description } as Metadata["openGraph"];
    out.twitter = { ...(out.twitter ?? {}), description: o.description } as Metadata["twitter"];
  }
  if (o.keywords) out.keywords = o.keywords.split(",").map((k) => k.trim()).filter(Boolean);
  if (o.noindex) out.robots = { index: false, follow: false };
  return out;
}
'''


def backup(f: Path):
    shutil.copy(f, str(f) + ".bak")


def seo_lib():
    f = root / "lib/seo.ts"
    s = f.read_text(encoding="utf-8")
    if "export function applySeo" in s:
        return "lib/seo.ts: already done"
    backup(f)
    f.write_text(s.rstrip() + "\n" + HELPERS, encoding="utf-8")
    return "lib/seo.ts: helpers added"


def wrap_page(rel: str, kind: str, key_expr: str, uses_props: bool):
    f = root / rel
    if not f.exists():
        return f"{rel}: not found - skipped"
    s = f.read_text(encoding="utf-8")
    if "applySeo" in s:
        return f"{rel}: already done"
    imp = 'import { applySeo, seoFor } from "@/lib/seo";\n'
    if 'import type { Metadata }' not in s and 'import { Metadata }' not in s and "Metadata" not in s.split("export")[0]:
        imp += 'import type { Metadata } from "next";\n'
    if "export async function generateMetadata(" in s:
        s2 = s.replace("export async function generateMetadata(", "async function generateMetadataBase(", 1)
        wrapper = (
            "\n\nexport async function generateMetadata(props: Parameters<typeof generateMetadataBase>[0]): Promise<Metadata> {\n"
            "  const m = await generateMetadataBase(props);\n"
            + (f"  const key = {key_expr};\n" if uses_props else f'  const key = {key_expr};\n')
            + f'  return applySeo(m, await seoFor("{kind}", key));\n}}\n')
    elif re.search(r"export const metadata(: Metadata)? =", s):
        s2 = re.sub(r"export const metadata(: Metadata)? =", "const baseMetadata: Metadata =", s, count=1)
        wrapper = ("\n\nexport async function generateMetadata(): Promise<Metadata> {\n"
                   f'  return applySeo(baseMetadata, await seoFor("{kind}", {key_expr}));\n}}\n')
    else:
        return f"{rel}: no metadata found - skipped"
    # put imports after the last top import line
    lines = s2.split("\n")
    last = max((i for i, l in enumerate(lines) if l.startswith("import ")), default=-1)
    lines.insert(last + 1, imp.rstrip("\n"))
    backup(f)
    f.write_text("\n".join(lines).rstrip() + wrapper, encoding="utf-8")
    return f"{rel}: updated"


out = [seo_lib()]
out.append(wrap_page("app/product/[slug]/page.tsx", "products", "(await props.params).slug", True))
out.append(wrap_page("app/category/[slug]/page.tsx", "categories", "(await props.params).slug", True))
for rel, key in [("app/page.tsx", "/"), ("app/shop/page.tsx", "/shop"), ("app/categories/page.tsx", "/categories"), ("app/track/page.tsx", "/track"),
                 ("app/about/page.tsx", "/about"), ("app/contact/page.tsx", "/contact"), ("app/privacy/page.tsx", "/privacy"),
                 ("app/terms/page.tsx", "/terms"), ("app/return-policy/page.tsx", "/return-policy")]:
    out.append(wrap_page(rel, "pages", f'"{key}"', False))
print("\n".join(out))
