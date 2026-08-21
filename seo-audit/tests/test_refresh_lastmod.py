"""Tests for seo-audit/refresh_lastmod.py. No network, no git, no disk writes.

The pure functions (path_of, apply_plan, validate, shared_modules) are tested
directly. The git-dependent ones are exercised through build_plan with
last_content_change stubbed, so the tests never depend on this repo's history.

Run:  python3 -m unittest discover -s seo-audit/tests -v
(Plain unittest.TestCase classes, so `pytest seo-audit/tests` works too.)
"""

from __future__ import annotations

import sys
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import refresh_lastmod as rl  # noqa: E402

HEAD = (
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
)
TAIL = "</urlset>\n"


def sitemap(*entries: tuple[str, str]) -> str:
    body = "".join(
        f"  <url>\n"
        f"    <loc>https://upaman.com{path}</loc>\n"
        f"    <lastmod>{lastmod}</lastmod>\n"
        f"    <changefreq>weekly</changefreq>\n"
        f"  </url>\n"
        for path, lastmod in entries
    )
    return HEAD + body + TAIL


class TestPathOf(unittest.TestCase):
    def test_strips_origin_and_trailing_slash(self):
        self.assertEqual(rl.path_of("https://upaman.com/gst-calculator"), "/gst-calculator")
        self.assertEqual(rl.path_of("https://upaman.com/guides/"), "/guides")

    def test_bare_root_stays_a_slash(self):
        self.assertEqual(rl.path_of("https://upaman.com/"), "/")


class TestRouteFile(unittest.TestCase):
    """Resolution against the real pages/ tree — the shapes that actually ship."""

    def test_resolves_a_flat_route(self):
        found = rl.route_file("/gst-calculator")
        self.assertIsNotNone(found)
        self.assertEqual(found.name, "gst-calculator.js")

    def test_resolves_a_directory_index(self):
        found = rl.route_file("/guides")
        self.assertIsNotNone(found)
        self.assertEqual(found.name, "index.js")
        self.assertEqual(found.parent.name, "guides")

    def test_resolves_a_dynamic_segment_to_its_bracket_file(self):
        found = rl.route_file("/paycheck/texas")
        self.assertIsNotNone(found)
        self.assertEqual(found.name, "[state].js")

    def test_unknown_path_resolves_to_nothing(self):
        self.assertIsNone(rl.route_file("/no-such-page-anywhere"))


class TestSharedModules(unittest.TestCase):
    def test_flags_only_modules_above_the_threshold(self):
        widely_used = Path("/repo/components/CalcLayout.tsx")
        one_off = Path("/repo/components/OnlyHere.tsx")
        routes = [Path(f"/repo/pages/p{i}.js") for i in range(20)]

        def fake_imports(route):
            # Every route pulls the shared layout; only the first pulls the one-off.
            extra = [one_off] if route == routes[0] else []
            return [route, widely_used] + extra

        with mock.patch.object(rl, "imports_of", side_effect=fake_imports):
            shared = rl.shared_modules(routes)

        self.assertIn(widely_used, shared)
        self.assertNotIn(one_off, shared)

    def test_content_files_drops_shared_but_keeps_the_route_file(self):
        route = Path("/repo/pages/x.js")
        shared_mod = Path("/repo/components/CalcLayout.tsx")
        own = Path("/repo/components/XCalculator.tsx")

        with mock.patch.object(rl, "imports_of", return_value=[route, shared_mod, own]):
            files = rl.content_files(route, {shared_mod})

        self.assertEqual(files, [route, own])


class TestBuildPlan(unittest.TestCase):
    """build_plan with git stubbed, so the assertions are about the decision logic."""

    def _plan(self, text, dates):
        """dates: url path -> (date, subject) that git would report."""
        route_for = {p: Path(f"/repo/pages{p}.js") for p in dates}
        by_route = {route_for[p]: dates[p] for p in dates}
        with mock.patch.object(rl, "shared_modules", return_value=set()), \
             mock.patch.object(rl, "all_route_files", return_value=[]), \
             mock.patch.object(rl, "content_files", side_effect=lambda e, s: [e]), \
             mock.patch.object(rl, "route_file", side_effect=route_for.get), \
             mock.patch.object(rl, "last_content_change", side_effect=lambda f: by_route.get(f[0])):
            return rl.build_plan(text)

    def test_advances_a_stale_entry(self):
        plan = self._plan(
            sitemap(("/a", "2026-02-24")),
            {"/a": ("2026-08-14", "Deepen the article")},
        )
        self.assertEqual(len(plan.bumps), 1)
        self.assertEqual(plan.bumps[0].old, "2026-02-24")
        self.assertEqual(plan.bumps[0].new, "2026-08-14")
        self.assertEqual(plan.bumps[0].source, "Deepen the article")

    def test_leaves_an_accurate_entry_alone(self):
        plan = self._plan(sitemap(("/a", "2026-08-14")), {"/a": ("2026-08-14", "x")})
        self.assertEqual(plan.bumps, [])
        self.assertEqual(plan.current, ["/a"])

    def test_never_rewinds_a_lastmod_newer_than_git(self):
        """A hand-set future date may record a data refresh git cannot see."""
        plan = self._plan(sitemap(("/a", "2026-08-20")), {"/a": ("2026-07-10", "x")})
        self.assertEqual(plan.bumps, [])
        self.assertEqual(plan.ahead_of_git, ["/a"])

    def test_unresolvable_url_is_skipped_not_guessed(self):
        plan = self._plan(sitemap(("/ghost", "2026-01-01")), {})
        self.assertEqual(plan.bumps, [])
        self.assertEqual(plan.unresolved, ["/ghost"])

    def test_counts_every_entry(self):
        text = sitemap(("/a", "2026-01-01"), ("/b", "2026-01-01"))
        plan = self._plan(text, {"/a": ("2026-08-14", "x"), "/b": ("2026-01-01", "y")})
        self.assertEqual(plan.total, 2)
        self.assertEqual(len(plan.bumps), 1)


class TestApplyPlan(unittest.TestCase):
    def test_rewrites_only_the_targeted_date(self):
        text = sitemap(("/a", "2026-02-24"), ("/b", "2026-03-05"))
        plan = rl.RefreshPlan(bumps=[rl.Bump("/a", "2026-02-24", "2026-08-14", "x")], total=2)
        out = rl.apply_plan(text, plan)

        self.assertIn("<lastmod>2026-08-14</lastmod>", out)
        self.assertIn("<lastmod>2026-03-05</lastmod>", out)
        self.assertNotIn("2026-02-24", out)

    def test_preserves_every_other_byte(self):
        text = sitemap(("/a", "2026-02-24"))
        plan = rl.RefreshPlan(bumps=[rl.Bump("/a", "2026-02-24", "2026-08-14", "x")], total=1)
        out = rl.apply_plan(text, plan)

        self.assertEqual(out, text.replace("2026-02-24", "2026-08-14"))
        self.assertIn("<changefreq>weekly</changefreq>", out)

    def test_entry_count_is_unchanged(self):
        text = sitemap(("/a", "2026-02-24"), ("/b", "2026-03-05"))
        plan = rl.RefreshPlan(bumps=[rl.Bump("/a", "2026-02-24", "2026-08-14", "x")], total=2)
        ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
        self.assertEqual(len(ET.fromstring(rl.apply_plan(text, plan)).findall(f"{ns}url")), 2)


class TestValidate(unittest.TestCase):
    def test_accepts_a_well_formed_sitemap(self):
        rl.validate(sitemap(("/a", "2026-08-14")), expected=1)

    def test_rejects_a_lost_entry(self):
        with self.assertRaises(ValueError):
            rl.validate(sitemap(("/a", "2026-08-14")), expected=2)

    def test_rejects_a_malformed_date(self):
        with self.assertRaises(ValueError):
            rl.validate(sitemap(("/a", "Aug 14 2026")), expected=1)


if __name__ == "__main__":
    unittest.main()
