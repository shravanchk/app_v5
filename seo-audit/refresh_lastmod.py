#!/usr/bin/env python3
"""Bring <lastmod> in public/sitemap.xml back in line with git history.

A <lastmod> is a claim about when a page last changed. When it is stale the
claim is false in the direction that costs us: Google reads "unchanged since
February", deprioritises the recrawl, and never sees the article and FAQ schema
that landed in July. The 2026-08-21 "Crawled - currently not indexed" export
had 91 of 134 static sitemap entries in exactly that state.

Truth is recoverable from git: a page's content is its route file plus the
local modules it imports, so the last commit touching any of them is the last
time the rendered page could have changed. That is what this computes.

Dates only ever move forward. A lastmod that is already newer than git is left
alone -- it may record a data refresh that never touched tracked source, and
silently rewinding it would withdraw a true freshness signal.

Usage:
    python3 seo-audit/refresh_lastmod.py --dry-run
    python3 seo-audit/refresh_lastmod.py --apply
"""

from __future__ import annotations

import argparse
import logging
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from pathlib import Path

logger = logging.getLogger("refresh_lastmod")

REPO_ROOT = Path(__file__).resolve().parent.parent
SITEMAP = REPO_ROOT / "public" / "sitemap.xml"
PAGES = REPO_ROOT / "pages"

SOURCE_EXTENSIONS = (".tsx", ".ts", ".js", ".jsx")

# How far to follow imports out of the route file. A page's own component and
# that component's helpers genuinely change what renders; past that the graph is
# almost entirely shared infrastructure.
MAX_IMPORT_DEPTH = 2

# A module reached from more than this share of routes is infrastructure, not
# any one page's content -- CalcLayout, Container, schema.js and friends. Dating
# pages off those collapses half the sitemap onto whichever day the last layout
# commit landed, which is both untrue per page and the sort of bulk-identical
# lastmod that gets a sitemap's freshness signals discounted wholesale.
#
# Measured on this repo the split is unambiguous: 74 modules are reached from
# exactly one route (the page's own component -- its real content), and the next
# rung up starts at nine. Anything at or above the threshold is shared.
SHARED_FAN_IN_RATIO = 0.05
MIN_SHARED_FAN_IN = 9

# Excluding a shared module can leave a page dated only by its route file. That
# is the deliberate trade: under-claiming freshness costs a slower recrawl,
# over-claiming it across the whole sitemap costs the signal itself.

# Commits that changed only presentation and should not advance any lastmod.
# Deliberately empty: the 2026-08-14 retheme also shipped the senior-citizen
# tax fix, shareable URLs and the hi/bn/mr/ta/te + de/fr/es strings, so it is a
# content commit despite the theme work riding along. Add a full 40-char SHA
# here only for a commit that is *purely* cosmetic.
COSMETIC_COMMITS: frozenset[str] = frozenset()

# The generated clusters. A <lastmod> is an invitation to recrawl, and as of the
# 2026-08-16 analysis these 218-odd template instances are the leading suspect
# for why the site reads as scaled content -- so inviting Google back to them is
# the one part of this refresh that could do harm rather than nothing. Passing
# --skip-template-clusters holds them at their existing dates and freshens only
# the hand-written pages.
TEMPLATE_CLUSTERS = (
    "/paycheck/",
    "/tax-on-salary/",
    "/hourly/",
    "/after-taxes/",
    "/uk/take-home/",
    "/uk/hourly/",
    "/germany/take-home/",
)

URL_BLOCK = re.compile(r"[ \t]*<url>.*?</url>\s*\n", re.DOTALL)
LOC = re.compile(r"<loc>\s*(.*?)\s*</loc>", re.DOTALL)
LASTMOD = re.compile(r"(<lastmod>)\s*(.*?)\s*(</lastmod>)", re.DOTALL)
LOCAL_IMPORT = re.compile(r"""(?:from|require\()\s*['"](\.\.?/[^'"]+)['"]""")


@dataclass
class Bump:
    """One entry whose lastmod git says is understated."""

    path: str
    old: str
    new: str
    source: str


@dataclass
class RefreshPlan:
    """What a run would do, before anything is written."""

    bumps: list[Bump] = field(default_factory=list)
    current: list[str] = field(default_factory=list)
    ahead_of_git: list[str] = field(default_factory=list)
    unresolved: list[str] = field(default_factory=list)
    held_template: list[str] = field(default_factory=list)
    total: int = 0


def path_of(url: str) -> str:
    """Path portion of an absolute URL, without a trailing slash."""
    without_scheme = re.sub(r"^https?://[^/]+", "", url.strip())
    return without_scheme.rstrip("/") or "/"


def _first_existing(*candidates: Path) -> Path | None:
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    return None


def route_file(url_path: str) -> Path | None:
    """Find the pages/ file that renders a URL, dynamic segments included.

    /us-mortgage-calculator -> pages/us-mortgage-calculator.js
    /guides                 -> pages/guides/index.js
    /paycheck/texas         -> pages/paycheck/[state].js
    """
    slug = url_path.strip("/")
    if not slug:
        return _first_existing(*(PAGES / f"index{e}" for e in SOURCE_EXTENSIONS))

    direct = _first_existing(
        *(PAGES / f"{slug}{e}" for e in SOURCE_EXTENSIONS),
        *(PAGES / slug / f"index{e}" for e in SOURCE_EXTENSIONS),
    )
    if direct:
        return direct

    # No literal file: the last segment is probably a dynamic parameter.
    parent, _, _ = slug.rpartition("/")
    directory = PAGES / parent if parent else PAGES
    if directory.is_dir():
        dynamic = sorted(
            child
            for child in directory.iterdir()
            if child.is_file()
            and child.name.startswith("[")
            and child.suffix in SOURCE_EXTENSIONS
        )
        if dynamic:
            return dynamic[0]
    return None


def imports_of(entry: Path) -> list[Path]:
    """Local modules reachable from a route file, following every edge."""
    collected: dict[Path, None] = {entry: None}
    frontier = [(entry, 0)]

    while frontier:
        current, depth = frontier.pop()
        if depth >= MAX_IMPORT_DEPTH:
            continue
        try:
            source = current.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        for specifier in LOCAL_IMPORT.findall(source):
            base = (current.parent / specifier).resolve()
            target = _first_existing(
                *(base.with_suffix(base.suffix + e) if base.suffix else base.with_suffix(e)
                  for e in SOURCE_EXTENSIONS),
                *(base / f"index{e}" for e in SOURCE_EXTENSIONS),
            )
            if target is None or target in collected:
                continue
            collected[target] = None
            frontier.append((target, depth + 1))

    return list(collected)


def all_route_files() -> list[Path]:
    """Every renderable route file under pages/, excluding Next.js internals."""
    return sorted(
        p
        for p in PAGES.rglob("*")
        if p.is_file()
        and p.suffix in SOURCE_EXTENSIONS
        and not p.name.startswith("_")
        and p.name != "404.js"
    )


def shared_modules(routes: list[Path]) -> set[Path]:
    """Modules reached from enough routes to be infrastructure rather than content."""
    fan_in: dict[Path, int] = {}
    for route in routes:
        for module in imports_of(route):
            if module != route:
                fan_in[module] = fan_in.get(module, 0) + 1

    threshold = max(MIN_SHARED_FAN_IN, int(len(routes) * SHARED_FAN_IN_RATIO))
    logger.info(
        "%d route files; treating modules reached from >=%d of them as shared",
        len(routes),
        threshold,
    )
    return {module for module, count in fan_in.items() if count >= threshold}


def content_files(entry: Path, shared: set[Path]) -> list[Path]:
    """The route file plus the modules that make this page distinct."""
    return [entry] + [m for m in imports_of(entry) if m != entry and m not in shared]


def last_content_change(files: list[Path]) -> tuple[str, str] | None:
    """Date and subject of the newest non-cosmetic commit touching any file."""
    if not files:
        return None
    relative = [str(f.relative_to(REPO_ROOT)) for f in files]
    result = subprocess.run(
        ["git", "log", "--format=%H%x1f%ad%x1f%s", "--date=short", "--", *relative],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    for line in result.stdout.splitlines():
        sha, _, rest = line.partition("\x1f")
        date, _, subject = rest.partition("\x1f")
        if sha in COSMETIC_COMMITS:
            continue
        return date, subject
    return None


def build_plan(sitemap_text: str, skip_templates: bool = False) -> RefreshPlan:
    """Decide which lastmod values to advance. Reads git, writes nothing."""
    blocks = URL_BLOCK.findall(sitemap_text)
    plan = RefreshPlan(total=len(blocks))
    shared = shared_modules(all_route_files())
    cache: dict[Path, tuple[str, str] | None] = {}

    for block in blocks:
        loc = LOC.search(block)
        stamp = LASTMOD.search(block)
        if not loc or not stamp:
            continue
        url_path = path_of(loc.group(1))
        declared = stamp.group(2)

        if skip_templates and url_path.startswith(TEMPLATE_CLUSTERS):
            plan.held_template.append(url_path)
            continue

        entry = route_file(url_path)
        if entry is None:
            plan.unresolved.append(url_path)
            continue

        if entry not in cache:
            cache[entry] = last_content_change(content_files(entry, shared))
        change = cache[entry]
        if change is None:
            plan.unresolved.append(url_path)
            continue

        actual, subject = change
        if actual > declared:
            plan.bumps.append(Bump(url_path, declared, actual, subject))
        elif actual < declared:
            plan.ahead_of_git.append(url_path)
        else:
            plan.current.append(url_path)

    return plan


def apply_plan(sitemap_text: str, plan: RefreshPlan) -> str:
    """Rewrite only the dated lines, preserving the rest byte-for-byte."""
    new_dates = {bump.path: bump.new for bump in plan.bumps}

    def rewrite(match: re.Match[str]) -> str:
        block = match.group(0)
        loc = LOC.search(block)
        if not loc:
            return block
        replacement = new_dates.get(path_of(loc.group(1)))
        if replacement is None:
            return block
        return LASTMOD.sub(lambda m: f"{m.group(1)}{replacement}{m.group(3)}", block, count=1)

    return URL_BLOCK.sub(rewrite, sitemap_text)


def validate(xml_text: str, expected: int) -> None:
    """Parse the result and assert nothing was lost. Raises on failure."""
    root = ET.fromstring(xml_text)
    ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    urls = root.findall(f"{ns}url")
    if len(urls) != expected:
        raise ValueError(f"expected {expected} <url> entries, parsed {len(urls)}")
    for url in urls:
        node = url.find(f"{ns}lastmod")
        if node is not None and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", (node.text or "").strip()):
            raise ValueError(f"malformed lastmod: {node.text!r}")
    logger.info("validated: parses as XML, %d <url> entries, all lastmod well-formed", len(urls))


def report(plan: RefreshPlan) -> None:
    print(f"\n  sitemap entries        : {plan.total}")
    print(f"  already accurate       : {len(plan.current)}")
    print(f"  newer than git (kept)  : {len(plan.ahead_of_git)}")
    print(f"  unresolved (skipped)   : {len(plan.unresolved)}")
    if plan.held_template:
        print(f"  template leaves (held) : {len(plan.held_template)}")
    print(f"  to advance             : {len(plan.bumps)}\n")

    if plan.bumps:
        width = max(len(b.path) for b in plan.bumps)
        for bump in sorted(plan.bumps, key=lambda b: (b.old, b.path)):
            print(f"    {bump.path:<{width}}  {bump.old} -> {bump.new}  {bump.source[:52]}")
    if plan.unresolved:
        print(f"\n  no route file for: {', '.join(sorted(plan.unresolved)[:8])}"
              + (" ..." if len(plan.unresolved) > 8 else ""))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--dry-run", action="store_true", help="report only, write nothing")
    mode.add_argument("--apply", action="store_true", help="rewrite the sitemap in place")
    parser.add_argument("--sitemap", type=Path, default=SITEMAP)
    parser.add_argument(
        "--skip-template-clusters",
        action="store_true",
        help="hold the generated clusters at their current dates (see TEMPLATE_CLUSTERS)",
    )
    args = parser.parse_args(argv)

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

    sitemap_text = args.sitemap.read_text(encoding="utf-8")
    plan = build_plan(sitemap_text, skip_templates=args.skip_template_clusters)
    report(plan)

    if not plan.bumps:
        print("\nNothing to advance — every lastmod already matches git.")
        return 0

    if args.dry_run:
        print("\nDry run — nothing written. Re-run with --apply to update the sitemap.")
        return 0

    updated = apply_plan(sitemap_text, plan)
    validate(updated, plan.total)
    args.sitemap.write_text(updated, encoding="utf-8")
    print(f"\nUpdated {args.sitemap.relative_to(REPO_ROOT)} — {len(plan.bumps)} lastmod values advanced.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
