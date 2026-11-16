#!/usr/bin/env python3
"""Registers the SEO router.  Usage: cd shop_backend && python3 apply_seo_patch.py app   (safe to run twice, saves .bak)"""
import shutil
import sys
from pathlib import Path

root = Path(sys.argv[1] if len(sys.argv) > 1 else "app")
f = root / "routers/__init__.py"
s = f.read_text(encoding="utf-8")
if "r_admin_seo" in s:
    print("routers/__init__.py: already done")
    raise SystemExit
imp = "from .admin.settings.patch_settings import router as r_admin_settings_patch_settings\n"
reg = "    r_admin_settings_patch_settings,\n"
if s.count(imp) != 1 or s.count(reg) != 1:
    raise SystemExit("routers/__init__.py: anchor not found - nothing was changed")
shutil.copy(f, str(f) + ".bak")
s = s.replace(imp, imp + "from .admin.seo.seo import router as r_admin_seo\n").replace(reg, reg + "    r_admin_seo,\n")
f.write_text(s, encoding="utf-8")
print("routers/__init__.py: SEO router registered (backup __init__.py.bak)")
