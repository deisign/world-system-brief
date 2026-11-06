#!/usr/bin/env python3
"""Quality gate for a *candidate*, not approval, of the original Draw Beautiful A03 SVG."""
import hashlib
import io
import json
import pathlib
import subprocess
import sys
import unittest
import xml.etree.ElementTree as ET

from PIL import Image
import cairosvg

HERE = pathlib.Path(__file__).resolve().parent
RENDER = HERE / "renders"
PASSPORT = HERE / "plate-passport.json"
SVG_NS = "{http://www.w3.org/2000/svg}"
INK = (35, 37, 35)
PAPER = (243, 235, 221)


def inspect_svg(filename):
    target = RENDER / filename
    data = target.read_bytes()
    svg = ET.fromstring(data)
    if svg.tag != SVG_NS + "svg":
        raise AssertionError("SVG root missing")
    if (svg.get("width"), svg.get("height"), svg.get("viewBox")) != (
        "960", "640", "0 0 960 640"
    ):
        raise AssertionError("Unexpected view or canvas")
    if any(tag in data.lower() for tag in (
        b"<image", b"<script", b"<foreignobject", b"data:image", b"javascript:"
    )):
        raise AssertionError("SVG embeds image or executable content")
    paths = svg.findall(".//" + SVG_NS + "path")
    if len(paths) < 50:
        raise AssertionError("Too few real engraving paths")
    for index in range(1, 4):
        kinds = {
            p.get("data-kind") for p in paths if p.get("data-stage") == str(index)
        }
        expected = {"mixer", "motor", "settler", "rim", "surface", "connection"}
        if not expected.issubset(kinds):
            raise AssertionError(f"Stage {index} missing {expected-kinds}")
    if target.stat().st_size > 2_000_000:
        raise AssertionError("Candidate plate too large")
    return {
        "sha256": hashlib.sha256(data).hexdigest(),
        "bytes": len(data),
        "physical_vector_layers": len(paths),
    }


def raster_proof(filename, width):
    data = cairosvg.svg2png(url=str(RENDER / filename), output_width=width)
    image = Image.open(io.BytesIO(data)).convert("RGB")
    pixels = image.load()
    # Bounding box of visible ink, using distance from known paper background.
    coords = []
    for y in range(image.height):
        for x in range(image.width):
            r, g, b = pixels[x, y]
            if max(abs(r - PAPER[0]), abs(g - PAPER[1]), abs(b - PAPER[2])) > 38:
                coords.append((x, y))
    if not coords:
        raise AssertionError("Rendered image contains no ink")
    x0, x1 = min(x for x, _ in coords), max(x for x, _ in coords)
    y0, y1 = min(y for _, y in coords), max(y for _, y in coords)
    if min(x0, y0, width - x1 - 1, image.height - y1 - 1) < width * 0.018:
        raise AssertionError("Composition clips or loses breathing room")
    if (x1 - x0) < width * .40 or (y1 - y0) < image.height * .24:
        raise AssertionError("Subject too small or nearly invisible")
    image.save(RENDER / f"{pathlib.Path(filename).stem}-{width}px.png")
    return {
        "width_px": width,
        "height_px": image.height,
        "ink_bbox_px": [x0, y0, x1, y1],
        "ink_coverage": round(len(coords) / (width * image.height), 4),
    }


def run_quality():
    info = json.loads(PASSPORT.read_text(encoding="utf-8"))
    assert info["status"] == "editorially_selected_composition__physical_review_pending"
    assert info["publication_approved"] is False
    assert info["geometry"]["stages"] == 3
    assert info["geometry"]["openSettler"] is True
    assert info["view"]["azimuth_degrees"] == -43
    assert info["view"]["elevation_degrees"] == 29
    assert all(info[k][lang].strip() for k in
               ("physical_role", "mechanism", "limitations", "alternate_text")
               for lang in ("en", "ua"))
    outputs = {}
    for mode in ("mass", "intaglio"):
        name = f"a03-2-spatial-open-settler-{mode}.svg"
        outputs[mode] = {
            "vector": inspect_svg(name),
            "raster": [raster_proof(name, width) for width in (390, 960, 1920)],
        }
    return {
        "status": "technical_qa_passed__editorial_review_pending",
        "engine_revision": info["engine"]["commit"],
        "scene": info["geometry"]["source"],
        "camera": info["view"],
        "outputs": outputs,
        "limits": [
            "These checks establish file validity and basic visual framing, not process-plant accuracy.",
            "Mobile reading of distinct components needs human review at actual display size.",
            "Not published in the WSB approved engraving catalog.",
        ],
    }


class PlateQualityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        subprocess.run(
            ["node", str(HERE / "build.mjs")],
            cwd=HERE, check=True, capture_output=True, text=True
        )

    def test_passport_is_bilingual_and_not_approved(self):
        info = json.loads(PASSPORT.read_text(encoding="utf-8"))
        self.assertFalse(info["publication_approved"])
        self.assertEqual(info["geometry"]["stages"], 3)
        for key in ("physical_role", "mechanism", "limitations", "alternate_text"):
            for lang in ("en", "ua"):
                self.assertGreater(len(info[key][lang]), 30)

    def test_svg_layers_are_real_and_all_three_stages_are_visible(self):
        for mode in ("mass", "intaglio"):
            info = inspect_svg(f"a03-2-spatial-open-settler-{mode}.svg")
            self.assertGreater(info["physical_vector_layers"], 50)

    def test_ink_is_not_cropped_at_phone_print_and_large_sizes(self):
        for mode in ("mass", "intaglio"):
            for width in (390, 960, 1920):
                result = raster_proof(f"a03-2-spatial-open-settler-{mode}.svg", width)
                self.assertGreater(result["ink_coverage"], .005)

    def test_original_physical_scene_is_deterministic(self):
        target = RENDER / "a03-2-spatial-open-settler-intaglio.svg"
        first = hashlib.sha256(target.read_bytes()).hexdigest()
        subprocess.run(
            ["node", str(HERE / "build.mjs")],
            cwd=HERE, check=True, capture_output=True, text=True
        )
        self.assertEqual(first, hashlib.sha256(target.read_bytes()).hexdigest())


if __name__ == "__main__":
    if "--check" in sys.argv:
        suite = unittest.defaultTestLoader.loadTestsFromTestCase(PlateQualityTests)
        test_result = unittest.TextTestRunner(verbosity=2).run(suite)
        if not test_result.wasSuccessful():
            sys.exit(1)
        report = run_quality()
        (RENDER / "plate-qa.json").write_text(
            json.dumps(report, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8"
        )
        print("A03 OPEN SETTLER TECHNICAL QA: PASS; EDITORIAL SIGNOFF STILL REQUIRED")
    else:
        unittest.main(verbosity=2)
