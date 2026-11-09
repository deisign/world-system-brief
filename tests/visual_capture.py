#!/usr/bin/env python3
"""Capture reproducible WSB editorial screenshots and measured layout QA."""
import json
import os
import pathlib
import threading

from playwright.sync_api import sync_playwright
from browser_smoke import PREFIX, ROOT, Server, SiteHandler

OUT = pathlib.Path("artifacts/visual-qa")
ROUTES = {
    "home": "/{lang}/",
    "read": "/{lang}/brief/2026-11-09/",
    "archive": "/{lang}/archive/",
    "ledger": "/{lang}/ledger/dependencies/",
    "ledger-entity": "/{lang}/ledger/dependencies/ai-gas-turbine-capacity-bottleneck/",
    "entities": "/{lang}/entities/",
    "entity-hormuz": "/{lang}/entity/hormuz/",
    "entity-turbines": "/{lang}/entity/ai-gas-turbine-capacity-bottleneck/",
    "system-map": "/{lang}/map/",
}
WIDTHS = (390, 768, 1440)


def capture():
    if not (ROOT / "ua" / "brief" / "2026-11-09" / "index.html").is_file():
        raise RuntimeError("WSB-0041 prefixed full build is required")
    OUT.mkdir(parents=True, exist_ok=True)
    server = Server(("127.0.0.1", 0), SiteHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f"http://127.0.0.1:{server.server_port}{PREFIX}"
    findings = []
    errors = []
    try:
        with sync_playwright() as driver:
            browser = driver.chromium.launch(
                headless=True,
                executable_path=os.environ.get("WSB_CHROMIUM_PATH") or None,
                args=["--no-sandbox"],
            )
            try:
                for lang in ("en", "ua"):
                    for name, template in ROUTES.items():
                        route = template.format(lang=lang)
                        for width in WIDTHS:
                            context = browser.new_context(viewport={"width": width, "height": 900}, device_scale_factor=1)
                            page = context.new_page()
                            js_errors = []
                            page.on("pageerror", lambda exc: js_errors.append(str(exc)))
                            try:
                                response = page.goto(base + route, wait_until="load", timeout=30000)
                                if not response or response.status != 200:
                                    raise RuntimeError(f"{route}: HTTP {response.status if response else 'none'}")
                                page.evaluate("document.fonts.ready")
                                measure = page.evaluate("""() => {
                                    const root = document.documentElement;
                                    const h1 = document.querySelector('h1');
                                    const mast = document.querySelector('.wordmark, .brand, .mast');
                                    const info = el => el ? ({
                                        font: getComputedStyle(el).fontFamily,
                                        fontSize: getComputedStyle(el).fontSize,
                                        width: Math.round(el.getBoundingClientRect().width)
                                    }) : null;
                                    return {
                                        viewport: root.clientWidth,
                                        document: root.scrollWidth,
                                        overflow: root.scrollWidth - root.clientWidth,
                                        title: document.title,
                                        h1: info(h1),
                                        mast: info(mast),
                                        horizontalOffenders: [...document.querySelectorAll('body *')].filter(el => {
                                            const r=el.getBoundingClientRect();
                                            const style=getComputedStyle(el);
                                            return r.width>0 && (r.right>innerWidth+2 || r.left< -2)
                                              && !['hidden','scroll','auto'].includes(style.overflowX)
                                              && !el.closest('.diagram, .graph-frame');
                                        }).slice(0,8).map(el => ({tag:el.tagName,cls:String(el.className).slice(0,70)}))
                                    };
                                }""")
                                record = {"lang": lang, "page": name, "width": width, "route": route, **measure}
                                findings.append(record)
                                if js_errors:
                                    errors.append(f"{route} at {width}px JS: {js_errors}")
                                if measure["overflow"] > 1:
                                    errors.append(f"{route} at {width}px has {measure['overflow']}px horizontal overflow")
                                filename = f"{lang}-{name}-{width}.png"
                                page.screenshot(path=str(OUT / filename), full_page=True, animations="disabled")
                                print(f"VISUAL_QA {lang} {name} {width}: overflow={measure['overflow']} h1={measure['h1']} screenshot={filename}", flush=True)
                            finally:
                                context.close()
            finally:
                browser.close()
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)
    (OUT / "measurements.json").write_text(json.dumps({"results": findings, "errors": errors}, ensure_ascii=False, indent=2) + "\n")
    print(f"VISUAL_QA_SUMMARY pages={len(findings)} failures={len(errors)}", flush=True)
    for error in errors:
        print(f"VISUAL_QA_FAIL {error}", flush=True)
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    capture()
