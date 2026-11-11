#!/usr/bin/env python3
"""Chromium smoke tests on final prefixed GitHub Pages artifact."""
import contextlib
import http.server
import json
import os
import pathlib
import threading
import unittest
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright

PREFIX = "/world-system-brief"
ROOT = pathlib.Path("dist").resolve()


class SiteHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def translate_path(self, url):
        path = urlsplit(url).path
        if path == PREFIX:
            path = "/"
        elif path.startswith(PREFIX + "/"):
            path = path[len(PREFIX):]
        else:
            return str(ROOT / "__not_found__")
        return super().translate_path(path)

    def log_message(self, fmt, *args):
        pass


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True


class BrowserSmoke(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not (ROOT / "ua" / "map" / "index.html").is_file():
            raise RuntimeError("Build the complete site, install fonts and prefix Pages URLs first")
        cls.server = Server(("127.0.0.1", 0), SiteHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = "http://127.0.0.1:%d%s" % (cls.server.server_port, PREFIX)
        cls.driver = sync_playwright().start()
        cls.browser = cls.driver.chromium.launch(
            headless=True,
            executable_path=os.environ.get("WSB_CHROMIUM_PATH") or None,
            args=["--no-sandbox"],
        )

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.driver.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=5)

    @contextlib.contextmanager
    def page_at(self, route, width=390):
        context = self.browser.new_context(viewport={"width": width, "height": 844}, device_scale_factor=1)
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        try:
            if os.environ.get("WSB_BROWSER_OFFLINE") == "1":
                file = ROOT / route.lstrip("/") / "index.html"
                self.assertTrue(file.is_file(), str(file))
                page.set_content(file.read_text(encoding="utf-8"), wait_until="domcontentloaded")
            else:
                response = page.goto(self.base + route, wait_until="load", timeout=30000)
                self.assertIsNotNone(response)
                self.assertEqual(response.status, 200, self.base + route)
            yield page
            self.assertEqual(errors, [], "Uncaught browser JavaScript error on " + route)
        finally:
            context.close()

    def test_routes_fonts_and_mobile_layout(self):
        routes = [
            "/ua/", "/ua/brief/2026-11-04/", "/ua/system/2026-11-04/",
            "/ua/poster/2026-11-04/", "/ua/visualizations/oil-network/",
            "/ua/map/", "/ua/editorial/reviews/", "/en/editorial/reviews/",
            "/en/structure/asml/",
            "/ua/ledger/dependencies/", "/en/ledger/dependencies/",
            "/ua/ledger/dependencies/uk-critical-minerals-resilience/",
            "/ua/engravings/", "/en/engravings/",
            "/ua/engravings/rare-earth-separation-study-01/",
            "/en/engravings/rare-earth-separation-study-01/",
        ]
        for width in (390, 768, 1440):
            for route in routes:
                with self.subTest(width=width, route=route), self.page_at(route, width) as page:
                    if route.endswith("/brief/2026-11-04/") or route == "/ua/":
                        size = page.evaluate("({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth})")
                        self.assertLessEqual(size["scroll"], size["client"] + 1, str(size))
                    if route == "/ua/":
                        self.assertGreater(page.locator("h1").count(), 0)
                        self.assertEqual(page.locator('link[href$="/assets/fonts/wsb.css"]').count(), 1)

    def test_system_map_select_reset_and_real_entity_links(self):
        for lang in ("en", "ua"):
            with self.subTest(lang=lang), self.page_at("/%s/map/" % lang) as page:
                original = int(page.locator("#edge-count").inner_text())
                self.assertGreater(original, 0)
                page.locator(".map-node").first.focus()
                page.keyboard.press("Enter")
                self.assertIn("1-hop", page.locator("#map-focus").inner_text())
                self.assertLessEqual(int(page.locator("#edge-count").inner_text()), original)
                hrefs = page.locator("#map-edges .map-edge > span a").evaluate_all(
                    "links => links.map(a=>a.getAttribute('href'))"
                )
                self.assertTrue(hrefs)
                base = "" if os.environ.get("WSB_BROWSER_OFFLINE") == "1" else PREFIX
                self.assertTrue(all(h.startswith(base + "/" + lang + "/entity/") for h in hrefs), str(hrefs))
                page.locator("#map-reset").focus()
                page.keyboard.press("Enter")
                self.assertEqual(int(page.locator("#edge-count").inner_text()), original)

    def test_review_desk_filters_validation_and_bilingual_draft(self):
        for lang in ("ua", "en"):
            with self.subTest(lang=lang), self.page_at("/%s/editorial/reviews/" % lang) as page:
                count = page.locator(".item").count()
                self.assertGreater(count, 0)
                page.locator("#filter").select_option("later")
                candidates = page.locator(".item:visible").count()
                self.assertGreater(candidates, 0)
                self.assertLess(candidates, count)
                page.locator("#search").fill("totally-absent-claim-id")
                self.assertEqual(page.locator(".item:visible").count(), 0)
                self.assertTrue(page.locator("#empty").is_visible())
                page.locator("#search").fill("")
                card = page.locator('.item[data-later="yes"]:visible').first
                card.locator("details").last.locator("summary").click()
                card.locator("button.generate").click()
                self.assertEqual(card.locator("textarea.output").input_value(), "")
                card.locator("details").nth(1).locator("summary").click()
                card.locator('input[type="radio"]').first.check()
                card.locator("select.decision").select_option("qualified")
                card.locator("textarea.en").fill(
                    "Later issue supplies a data point that requires editorial verification."
                )
                card.locator("textarea.ua").fill(
                    "Пізніший випуск містить свідчення, яке вимагає редакційної перевірки."
                )
                card.locator("button.generate").click()
                draft = json.loads(card.locator("textarea.output").input_value())
                self.assertEqual(draft["decision"], "qualified")
                self.assertEqual(draft["target_claim_id"], card.locator(".meta").inner_text().split(" · ")[0])
                self.assertEqual(len(draft["source_ids"]), 1)
                self.assertTrue(draft["reason"]["en"])
                self.assertTrue(draft["reason"]["ua"])
                self.assertTrue(draft["issue_id"])

    def test_engraving_picture_chooses_original_svg_for_desktop_and_sparse_svg_for_phone(self):
        for lang in ("ua", "en"):
            route = "/%s/engravings/rare-earth-separation-study-01/" % lang
            for width, suffix in ((390, "-mobile.svg"), (1440, "rare-earth-separation-study-01.svg")):
                with self.subTest(lang=lang, width=width), self.page_at(route, width) as page:
                    image = page.locator("figure picture img")
                    self.assertEqual(image.count(), 1)
                    self.assertTrue(image.get_attribute("alt"))
                    data = image.evaluate("el => ({url:el.currentSrc,ok:el.complete && el.naturalWidth > 0})")
                    self.assertTrue(data["ok"], str(data))
                    self.assertTrue(data["url"].endswith(suffix), str(data))
                    self.assertIn("uk-critical-minerals-resilience", page.locator("section.editorial a").first.get_attribute("href"))

    def test_issue_0040_has_real_source_bound_svg_diagram_near_lead(self):
        for lang in ("en", "ua"):
            with self.subTest(lang=lang), self.page_at("/%s/brief/2026-11-06/" % lang, 390) as page:
                chart = page.locator("section.issue-chart svg[aria-labelledby='g-title g-desc']")
                self.assertEqual(chart.count(), 1)
                self.assertIn("86%", chart.text_content())
                self.assertIn(">50%", chart.text_content())
                self.assertIn("WSB-0040-SRC-02", chart.text_content())
                self.assertLess(chart.bounding_box()["y"], page.locator("article h2").last.bounding_box()["y"])
                self.assertTrue(page.locator('a[href$="/visualizations/0040/"]').count() > 0)
            with self.subTest(lang=lang, view="full"), self.page_at("/%s/visualizations/0040/" % lang, 960) as page:
                self.assertEqual(page.locator('svg title#g-title').count(), 1)
                self.assertEqual(page.locator('svg rect').count() > 5, True)
                self.assertEqual(page.locator('a[href^="https://www.reuters.com/"]').count(), 2)
                self.assertEqual(page.locator('img').count(), 0)

    def test_horizontal_diagrams_touch_and_keyboard(self):
        routes = [
            ("/ua/poster/2026-11-04/", ".diagram"),
            ("/ua/visualizations/oil-network/", ".graph-frame"),
        ]
        for route, selector in routes:
            with self.subTest(route=route), self.page_at(route) as page:
                region = page.locator(selector)
                sizes = region.evaluate("e => ({client:e.clientWidth,scroll:e.scrollWidth})")
                self.assertGreater(sizes["scroll"], sizes["client"] + 50)
                region.focus()
                for _ in range(6):
                    page.keyboard.press("ArrowRight")
                page.wait_for_timeout(400)
                self.assertGreater(region.evaluate("e => e.scrollLeft"), 0)
                region.evaluate("e => e.scrollLeft=0")
                bounds = region.bounding_box()
                self.assertIsNotNone(bounds)
                x = bounds["x"] + min(220, bounds["width"] - 20)
                y = bounds["y"] + min(bounds["height"] / 2, 130)
                cdp = page.context.new_cdp_session(page)
                cdp.send("Input.dispatchTouchEvent", {
                    "type": "touchStart", "touchPoints": [{"x": x, "y": y}]
                })
                for offset in range(30, 181, 30):
                    cdp.send("Input.dispatchTouchEvent", {
                        "type": "touchMove", "touchPoints": [{"x": x - offset, "y": y}]
                    })
                    page.wait_for_timeout(18)
                cdp.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []})
                page.wait_for_timeout(250)
                self.assertGreater(region.evaluate("e => e.scrollLeft"), 30)


    def test_reader_journey_from_issue_to_entity_and_ledger(self):
        for lang in ("en", "ua"):
            with self.subTest(lang=lang), self.page_at(f"/{lang}/brief/2026-11-09/", 390) as page:
                issue = page.locator("#issue-entities")
                self.assertEqual(issue.count(), 1)
                page.locator(f'#issue-entities a[href$="/{lang}/entity/ai-gas-turbine-capacity-bottleneck/"]').first.click()
                self.assertIn("/entity/ai-gas-turbine-capacity-bottleneck/", page.url)
                page.locator(f'a[href$="/{lang}/ledger/dependencies/ai-gas-turbine-capacity-bottleneck/"]').first.click()
                self.assertIn("/ledger/dependencies/ai-gas-turbine-capacity-bottleneck/", page.url)
                page.locator(f'.reader-ledger-bridge a[href$="/{lang}/entity/ai-gas-turbine-capacity-bottleneck/"]').click()
                self.assertIn("/entity/ai-gas-turbine-capacity-bottleneck/", page.url)
            with self.subTest(lang=lang, study="oil"), self.page_at(f"/{lang}/entity/hormuz/", 390) as page:
                page.locator(f'.reader-mechanism a[href$="/{lang}/visualizations/oil-network/"]').click()
                self.assertIn("/visualizations/oil-network/", page.url)


    def test_system_topology_keyboard_and_temporal_filters(self):
        for lang in ("en", "ua"):
            with self.subTest(lang=lang), self.page_at(f"/{lang}/map/", 390) as page:
                visual = page.locator("#system-visual-svg")
                self.assertEqual(visual.count(), 1)
                self.assertIn("not a geographic map" if lang=="en" else "не географічна карта", visual.locator("title#system-visual-title").text_content())
                total = int(page.locator("#edge-count").inner_text())
                self.assertGreater(total, 0)
                self.assertGreater(page.locator("[data-map-visual-node]").count(), 0)
                initial = page.locator("[data-map-visual-node]").first.get_attribute("data-map-visual-node")
                page.locator("[data-map-visual-node]").first.focus()
                page.keyboard.press("Enter")
                self.assertIn("1-hop", page.locator("#map-focus").inner_text())
                self.assertLessEqual(int(page.locator("#edge-count").inner_text()), total)
                self.assertEqual(page.locator("[data-map-visual-node].is-focus").count(), 1)
                page.locator("#map-reset").click()
                self.assertEqual(int(page.locator("#edge-count").inner_text()), total)
                self.assertEqual(page.locator("#map-focus").inner_text().strip(), "all" if lang=="en" else "усі")
                box = page.locator(".map-visual-frame")
                dims = box.evaluate("e => ({client:e.clientWidth,scroll:e.scrollWidth})")
                self.assertGreater(dims["scroll"],dims["client"])
                source_urls = page.locator(".map-edge-sources a").evaluate_all("a=>a.map(x=>x.href)")
                self.assertTrue(all(url.startswith("https://") for url in source_urls))


    def test_relation_changelog_tracks_selected_date_without_inventing_delta(self):
        for lang in ("en", "ua"):
            with self.subTest(lang=lang), self.page_at(f"/{lang}/map/", 390) as page:
                self.assertEqual(page.locator("#relation-changelog").count(), 1)
                self.assertEqual(page.locator("#map-asof").inner_text(), "2026-11-11")
                current = page.locator("#relation-changelog .relation-change")
                self.assertEqual(current.count(), 3)
                self.assertEqual(current.first.get_attribute("data-change-kind"), "first_recorded")
                self.assertEqual(page.locator("#relation-changelog [data-change-kind^='confirmed']").count(), 0)
                page.locator("#map-date").select_option("2026-11-09")
                self.assertEqual(page.locator("#relation-changelog .relation-change").count(), 0)
                self.assertEqual(page.locator("#map-asof").inner_text(), "2026-11-09")
                page.locator("#map-date").select_option("2026-11-11")
                self.assertEqual(page.locator("#relation-changelog .relation-change").count(), 3)
                self.assertEqual(page.locator("#relation-changelog .relation-change").first.get_attribute("data-change-kind"), "first_recorded")


    def test_entity_connectivity_directory_audits_registered_entities_without_fabricating_links(self):
        for lang in ("en", "ua"):
            with self.subTest(lang=lang), self.page_at(f"/{lang}/map/", 390) as page:
                entries = page.locator("#entity-connections .connectivity-item")
                self.assertEqual(entries.count(), 100)
                self.assertEqual(page.locator("#connectivity-visible").inner_text(), "100")
                page.locator("#connectivity-mode").select_option("isolated")
                remaining = page.locator("#entity-connections .connectivity-item:visible")
                self.assertGreater(remaining.count(), 0)
                self.assertLess(remaining.count(), 100)
                page.locator("#connectivity-search").fill("europe-dispatchable-power-flexibility")
                self.assertEqual(page.locator("#entity-connections .connectivity-item:visible").count(), 1)
                self.assertEqual(page.locator("#entity-connections .connectivity-item:visible").first.get_attribute("data-mode"), "isolated")
                page.locator("#connectivity-mode").select_option("all")
                page.locator("#connectivity-search").fill("china-smart-port-technology-stack")
                card = page.locator("#entity-connections .connectivity-item:visible")
                self.assertEqual(card.count(), 1)
                card.locator("summary").click()
                self.assertGreater(card.locator(".connectivity-proof a").count(), 0)
                self.assertIn("/entity/china-smart-port-technology-stack/", card.locator(".connectivity-detail a[href*='/entity/']").get_attribute("href"))


    def test_context_overlay_is_opt_in_and_never_changes_explicit_relation_count(self):
        for lang in ("en", "ua"):
            with self.subTest(lang=lang), self.page_at(f"/{lang}/map/", 390) as page:
                toggle = page.locator("#map-context-toggle")
                self.assertFalse(toggle.is_checked())
                self.assertEqual(page.locator("#system-visual-svg .visual-context-edge").count(), 0)
                explicit = int(page.locator("#edge-count").inner_text())
                toggle.check()
                self.assertTrue(toggle.is_checked())
                self.assertGreater(page.locator("#system-visual-svg .visual-context-edge").count(), 0)
                self.assertEqual(int(page.locator("#edge-count").inner_text()), explicit)
                self.assertGreater(page.locator("#system-visual-svg .visual-edge").count(), 0)
                page.locator("#map-reset").click()
                self.assertFalse(toggle.is_checked())
                self.assertEqual(page.locator("#system-visual-svg .visual-context-edge").count(), 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
