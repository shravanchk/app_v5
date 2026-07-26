#!/usr/bin/env python3
"""Remove URLs Google has refused to crawl from public/sitemap.xml.

A sitemap is a request for crawl budget. Advertising URLs that Google has
already declined to fetch spends that budget on nothing and starves the pages
you actually want indexed.

This reads a Google Search Console "Discovered - currently not indexed"
drilldown export, keeps only the entries Google has *never crawled*
(Last crawled = 1970-01-01, GSC's null), optionally restricts them to a set of
path prefixes, and strips the matching <url> blocks out of the sitemap.

Hub pages are always kept: removing /paycheck would orphan the cluster from
the sitemap entirely, and the hub is a page we still want ranked.

The pages themselves are NOT deleted and stay internally linked, so they remain
discoverable. This only withdraws the explicit crawl request.

Usage:
    python3 seo-audit/trim_sitemap.py --dry-run
    python3 seo-audit/trim_sitemap.py --apply
"""

from __future__ import annotations

import argparse
import csv
import logging
import re
import sys
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from pathlib import Path

logger = logging.getLogger("trim_sitemap")

REPO_ROOT = Path(__file__).resolve().parent.parent
SITEMAP = REPO_ROOT / "public" / "sitemap.xml"
GSC_DIR = REPO_ROOT / "seo-audit" / "gsc"

# GSC writes the Unix epoch when a URL has been discovered but never fetched.
NEVER_CRAWLED = "1970-01-01"

# Only these clusters are eligible for removal. Everything else in the
# never-crawled set (/guides, /tools, /workflows, /us-paycheck-calculator, the
# standalone calculators) is a page we want indexed — those stay, because
# freeing budget for them is the entire point.
ELIGIBLE_PREFIXES = ("/paycheck/", "/tax-on-salary/")

# Never strip a cluster hub, even if it is uncrawled.
PROTECTED = frozenset({"/paycheck", "/tax-on-salary"})

URL_BLOCK = re.compile(r"[ \t]*<url>.*?</url>\s*\n", re.DOTALL)
LOC = re.compile(r"<loc>\s*(.*?)\s*</loc>", re.DOTALL)


@dataclass
class TrimPlan:
    """What a run would do, before anything is written."""

    remove: list[str] = field(default_factory=list)
    kept_protected: list[str] = field(default_factory=list)
    kept_ineligible: list[str] = field(default_factory=list)
    not_in_sitemap: list[str] = field(default_factory=list)
    before: int = 0

    @property
    def after(self) -> int:
        return self.before - len(self.remove)


def path_of(url: str) -> str:
    """Path portion of an absolute URL, without a trailing slash."""
    without_scheme = re.sub(r"^https?://[^/]+", "", url.strip())
    return without_scheme.rstrip("/") or "/"


def read_never_crawled(csv_paths: list[Path]) -> list[str]:
    """Collect URLs from GSC drilldown exports that were never fetched."""
    urls: list[str] = []
    seen: set[str] = set()
    for path in csv_paths:
        with path.open(encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            if reader.fieldnames is None or "URL" not in reader.fieldnames:
                logger.warning("%s has no URL column — skipping", path)
                continue
            for row in reader:
                url = (row.get("URL") or "").strip()
                crawled = (row.get("Last crawled") or "").strip()
                if not url or crawled != NEVER_CRAWLED or url in seen:
                    continue
                seen.add(url)
                urls.append(url)
    logger.info("read %d never-crawled URLs from %d export(s)", len(urls), len(csv_paths))
    return urls


def find_discovered_exports(gsc_dir: Path) -> list[Path]:
    """Locate 'Discovered - currently not indexed' drilldown tables."""
    found: list[Path] = []
    for meta in sorted(gsc_dir.glob("*/Metadata.csv")):
        text = meta.read_text(encoding="utf-8", errors="replace")
        # GSC uses an en dash here, hence the loose match.
        if "Discovered" in text and "not indexed" in text:
            table = meta.parent / "Table.csv"
            if table.exists():
                found.append(table)
    return found


def build_plan(sitemap_text: str, candidates: list[str]) -> TrimPlan:
    """Decide which sitemap entries to drop. Pure — touches no files."""
    blocks = URL_BLOCK.findall(sitemap_text)
    in_sitemap = {path_of(m.group(1)) for b in blocks if (m := LOC.search(b))}

    plan = TrimPlan(before=len(blocks))
    for url in candidates:
        path = path_of(url)
        if path in PROTECTED:
            plan.kept_protected.append(path)
        elif not path.startswith(ELIGIBLE_PREFIXES):
            plan.kept_ineligible.append(path)
        elif path not in in_sitemap:
            plan.not_in_sitemap.append(path)
        else:
            plan.remove.append(path)
    return plan


def apply_plan(sitemap_text: str, plan: TrimPlan) -> str:
    """Strip the planned <url> blocks, preserving the rest byte-for-byte."""
    doomed = set(plan.remove)

    def keep(match: re.Match[str]) -> str:
        loc = LOC.search(match.group(0))
        if loc and path_of(loc.group(1)) in doomed:
            return ""
        return match.group(0)

    return URL_BLOCK.sub(keep, sitemap_text)


def validate(xml_text: str, expected: int) -> None:
    """Parse the result and assert the entry count. Raises on failure."""
    root = ET.fromstring(xml_text)
    ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    actual = len(root.findall(f"{ns}url"))
    if actual != expected:
        raise ValueError(f"expected {expected} <url> entries after trim, parsed {actual}")
    logger.info("validated: parses as XML, %d <url> entries", actual)


def report(plan: TrimPlan) -> None:
    print(f"\n  sitemap entries before : {plan.before}")
    print(f"  to remove              : {len(plan.remove)}")
    print(f"  sitemap entries after  : {plan.after}\n")

    by_cluster: dict[str, int] = {}
    for path in plan.remove:
        cluster = "/" + path.split("/")[1]
        by_cluster[cluster] = by_cluster.get(cluster, 0) + 1
    for cluster, count in sorted(by_cluster.items()):
        print(f"    {cluster}/*  -{count}")

    if plan.kept_protected:
        print(f"\n  kept (cluster hub)      : {', '.join(sorted(set(plan.kept_protected)))}")
    if plan.kept_ineligible:
        print(f"  kept (want these indexed, {len(plan.kept_ineligible)}):")
        for path in sorted(plan.kept_ineligible):
            print(f"    {path}")
    if plan.not_in_sitemap:
        print(f"  skipped (not in sitemap): {len(plan.not_in_sitemap)}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--dry-run", action="store_true", help="report only, write nothing")
    mode.add_argument("--apply", action="store_true", help="rewrite the sitemap in place")
    parser.add_argument("--sitemap", type=Path, default=SITEMAP)
    parser.add_argument("--gsc-dir", type=Path, default=GSC_DIR)
    args = parser.parse_args(argv)

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

    exports = find_discovered_exports(args.gsc_dir)
    if not exports:
        logger.error("no 'Discovered - currently not indexed' export under %s", args.gsc_dir)
        return 1
    logger.info("using export(s): %s", ", ".join(str(p.parent.name) for p in exports))

    sitemap_text = args.sitemap.read_text(encoding="utf-8")
    plan = build_plan(sitemap_text, read_never_crawled(exports))
    report(plan)

    if not plan.remove:
        print("\nNothing to remove — sitemap already trimmed.")
        return 0

    if args.dry_run:
        print("\nDry run. Re-run with --apply to write.")
        return 0

    trimmed = apply_plan(sitemap_text, plan)
    validate(trimmed, plan.after)
    args.sitemap.write_text(trimmed, encoding="utf-8")
    print(f"\nWrote {args.sitemap.relative_to(REPO_ROOT)} ({plan.before} -> {plan.after} entries).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
