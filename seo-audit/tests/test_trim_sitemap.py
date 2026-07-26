"""Tests for seo-audit/trim_sitemap.py. No network, no fixtures on disk.

Run:  python3 -m unittest discover -s seo-audit/tests -v
(These are plain unittest.TestCase classes, so `pytest seo-audit/tests` works too.)
"""

from __future__ import annotations

import sys
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from trim_sitemap import (  # noqa: E402
    NEVER_CRAWLED,
    apply_plan,
    build_plan,
    path_of,
    read_never_crawled,
    validate,
)

HEAD = (
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
)
TAIL = "</urlset>\n"


def sitemap(*paths: str) -> str:
    entries = "".join(
        f"  <url>\n"
        f"    <loc>https://upaman.com{p}</loc>\n"
        f"    <lastmod>2026-07-06</lastmod>\n"
        f"    <priority>0.64</priority>\n"
        f"  </url>\n"
        for p in paths
    )
    return HEAD + entries + TAIL


def gsc_csv(tmp: Path, rows: list[tuple[str, str]], issue: str = "Discovered – currently not indexed") -> Path:
    d = tmp / issue.replace(" ", "-").replace("–", "-")
    d.mkdir(parents=True, exist_ok=True)
    (d / "Metadata.csv").write_text(f"Property,Value\nSitemap,All known pages\nIssue,{issue}\n", encoding="utf-8")
    body = "URL,Last crawled\n" + "".join(f"https://upaman.com{p},{c}\n" for p, c in rows)
    (d / "Table.csv").write_text(body, encoding="utf-8")
    return d / "Table.csv"


class PathNormalisation(unittest.TestCase):
    def test_strips_scheme_host_and_trailing_slash(self):
        self.assertEqual(path_of("https://upaman.com/paycheck/texas"), "/paycheck/texas")
        self.assertEqual(path_of("http://www.upaman.com/paycheck/texas/"), "/paycheck/texas")
        self.assertEqual(path_of("https://upaman.com/"), "/")


class ReadNeverCrawled(unittest.TestCase):
    def test_keeps_only_epoch_dated_rows(self):
        with TempDir() as tmp:
            csv_path = gsc_csv(tmp, [
                ("/paycheck/texas", NEVER_CRAWLED),
                ("/paycheck/illinois", "2026-07-11"),  # crawled — must not be dropped
                ("/tax-on-salary/9-lakh", NEVER_CRAWLED),
            ])
            urls = read_never_crawled([csv_path])
        self.assertEqual([path_of(u) for u in urls], ["/paycheck/texas", "/tax-on-salary/9-lakh"])

    def test_deduplicates_across_exports(self):
        with TempDir() as tmp:
            a = gsc_csv(tmp / "a", [("/paycheck/texas", NEVER_CRAWLED)])
            b = gsc_csv(tmp / "b", [("/paycheck/texas", NEVER_CRAWLED)])
            self.assertEqual(len(read_never_crawled([a, b])), 1)


class PlanRules(unittest.TestCase):
    def test_removes_eligible_cluster_leaves(self):
        text = sitemap("/", "/paycheck/texas", "/tax-on-salary/9-lakh")
        plan = build_plan(text, ["https://upaman.com/paycheck/texas",
                                 "https://upaman.com/tax-on-salary/9-lakh"])
        self.assertEqual(sorted(plan.remove), ["/paycheck/texas", "/tax-on-salary/9-lakh"])
        self.assertEqual(plan.before, 3)
        self.assertEqual(plan.after, 1)

    def test_never_removes_a_cluster_hub(self):
        text = sitemap("/paycheck", "/tax-on-salary", "/paycheck/texas")
        plan = build_plan(text, ["https://upaman.com/paycheck",
                                 "https://upaman.com/tax-on-salary",
                                 "https://upaman.com/paycheck/texas"])
        self.assertEqual(plan.remove, ["/paycheck/texas"])
        self.assertEqual(sorted(plan.kept_protected), ["/paycheck", "/tax-on-salary"])

    def test_keeps_pages_we_want_indexed(self):
        """The whole point is freeing budget for these — they must survive."""
        wanted = ["/guides", "/tools", "/workflows", "/us-paycheck-calculator",
                  "/netherlands-salary-calculator", "/bmr-calculator"]
        text = sitemap(*wanted, "/paycheck/texas")
        plan = build_plan(text, [f"https://upaman.com{p}" for p in wanted + ["/paycheck/texas"]])
        self.assertEqual(plan.remove, ["/paycheck/texas"])
        self.assertEqual(sorted(plan.kept_ineligible), sorted(wanted))

    def test_candidate_absent_from_sitemap_is_skipped_not_removed(self):
        plan = build_plan(sitemap("/"), ["https://upaman.com/paycheck/texas"])
        self.assertEqual(plan.remove, [])
        self.assertEqual(plan.not_in_sitemap, ["/paycheck/texas"])

    def test_build_plan_does_not_mutate_the_sitemap(self):
        text = sitemap("/", "/paycheck/texas")
        build_plan(text, ["https://upaman.com/paycheck/texas"])
        self.assertIn("/paycheck/texas", text)


class ApplyPlan(unittest.TestCase):
    def test_removes_exactly_the_planned_blocks(self):
        text = sitemap("/", "/paycheck/texas", "/paycheck/illinois")
        plan = build_plan(text, ["https://upaman.com/paycheck/texas"])
        out = apply_plan(text, plan)
        self.assertNotIn("/paycheck/texas", out)
        self.assertIn("/paycheck/illinois", out)
        self.assertIn("<loc>https://upaman.com/</loc>", out)

    def test_result_is_still_well_formed_xml_with_the_right_count(self):
        text = sitemap("/", "/paycheck/texas", "/tax-on-salary/9-lakh")
        plan = build_plan(text, ["https://upaman.com/paycheck/texas",
                                 "https://upaman.com/tax-on-salary/9-lakh"])
        out = apply_plan(text, plan)
        ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
        self.assertEqual(len(ET.fromstring(out).findall(f"{ns}url")), 1)
        validate(out, plan.after)  # must not raise

    def test_prefix_collision_does_not_remove_a_sibling(self):
        """/paycheck/new-york must not be caught when removing /paycheck/new."""
        text = sitemap("/paycheck/new", "/paycheck/new-york")
        plan = build_plan(text, ["https://upaman.com/paycheck/new"])
        out = apply_plan(text, plan)
        self.assertIn("/paycheck/new-york", out)
        self.assertNotIn("<loc>https://upaman.com/paycheck/new</loc>", out)

    def test_is_idempotent(self):
        text = sitemap("/", "/paycheck/texas")
        candidates = ["https://upaman.com/paycheck/texas"]
        once = apply_plan(text, build_plan(text, candidates))
        twice = apply_plan(once, build_plan(once, candidates))
        self.assertEqual(once, twice)

    def test_preserves_non_url_content_byte_for_byte(self):
        text = sitemap("/", "/paycheck/texas")
        out = apply_plan(text, build_plan(text, ["https://upaman.com/paycheck/texas"]))
        self.assertTrue(out.startswith(HEAD))
        self.assertTrue(out.endswith(TAIL))


class Validation(unittest.TestCase):
    def test_raises_when_the_count_does_not_match(self):
        with self.assertRaises(ValueError):
            validate(sitemap("/", "/paycheck/texas"), expected=1)

    def test_raises_on_malformed_xml(self):
        with self.assertRaises(ET.ParseError):
            validate(HEAD + "  <url><loc>broken</loc>\n" + TAIL, expected=1)


class TempDir:
    """Minimal scoped temp directory (avoids a pytest tmp_path dependency)."""

    def __enter__(self) -> Path:
        import tempfile
        self._dir = tempfile.TemporaryDirectory()
        return Path(self._dir.name)

    def __exit__(self, *exc: object) -> None:
        self._dir.cleanup()


if __name__ == "__main__":
    unittest.main(verbosity=2)
