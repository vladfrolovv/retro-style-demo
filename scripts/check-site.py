import re
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent / "site"
FILE_LIMIT = 100 * 1024 * 1024
SITE_LIMIT = 1024 * 1024 * 1024
URL = re.compile(r"""(?:src|href|poster)="([^"#:]+)"|url\("?([^")]+)"?\)|"((?:media|assets|game)/[^"]+)\"""")

problems = []


def exact(path):
    current = SITE
    for part in path.relative_to(SITE).parts:
        if part not in {p.name for p in current.iterdir()}:
            return False
        current = current / part
    return True


for source in [SITE / "index.html", SITE / "config.js", *SITE.glob("css/*.css")]:
    text = source.read_text(encoding="utf-8")
    for match in URL.finditer(text):
        ref = next(g for g in match.groups() if g)
        if ref.startswith(("http", "data:", "mailto:")):
            continue
        target = (source.parent / ref).resolve()
        if not target.exists() or not exact(target):
            problems.append(f"{source.relative_to(SITE)} references missing or wrong-case file: {ref}")

total = 0
for file in SITE.rglob("*"):
    if not file.is_file():
        continue
    size = file.stat().st_size
    total += size
    if size >= FILE_LIMIT:
        problems.append(f"{file.relative_to(SITE)} is {size} bytes, over the 100 MiB Git limit")
    with file.open("rb") as handle:
        if handle.read(40).startswith(b"version https://git-lfs"):
            problems.append(f"{file.relative_to(SITE)} is a Git LFS pointer, not the real file")

if total >= SITE_LIMIT:
    problems.append(f"site is {total} bytes, over the 1 GB GitHub Pages limit")

print(f"site: {total / 1024 / 1024:.1f} MiB in {sum(1 for f in SITE.rglob('*') if f.is_file())} files")
for problem in problems:
    print("ERROR:", problem)
sys.exit(1 if problems else 0)
