#!/usr/bin/env python3
"""Snapshot and compare the content inside <main> on the Us pages.

Usage:
  python3 -I scripts/content_check.py --baseline   # write scripts/.content_baseline.json
  python3 -I scripts/content_check.py --compare    # diff current pages against baseline
  Add --set tools to use the Tools pages (baseline: scripts/.content_baseline_tools.json).

Captures, per page: normalized visible text, every img (src, alt), every a (href, text).
Text inside elements with aria-hidden="true" or HTML comments is ignored.
"""
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SETS = {
    "us": [
    "our-story.html",
    "our-community.html",
    "our-networks.html",
    "our-campaigns.html",
    "rice.html",
    "organizing-circle.html",
    "announcements.html",
    ],
    "tools": [
        "know-your-rights.html",
        "know-your-rights-ice.html",
        "pass-coalition-plan.html",
        "lao-deportation-toolkit.html",
    ],
}
SET = sys.argv[sys.argv.index("--set") + 1] if "--set" in sys.argv else "us"
PAGES = SETS[SET]
BASELINE = Path(__file__).resolve().parent / (
    ".content_baseline.json" if SET == "us" else f".content_baseline_{SET}.json")
VOID = {"img", "br", "hr", "input", "meta", "link", "source", "wbr"}


class MainExtractor(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_main = 0
        self.hidden_depth = 0
        self.stack = []
        self.text = []
        self.images = []
        self.links = []
        self._link = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "main":
            self.in_main += 1
        if not self.in_main:
            return
        if tag not in VOID:
            hidden = a.get("aria-hidden") == "true"
            self.stack.append((tag, hidden))
            if hidden:
                self.hidden_depth += 1
        if self.hidden_depth:
            return
        if tag == "img":
            self.images.append({"src": a.get("src", ""), "alt": a.get("alt")})
        elif tag == "a":
            self._link = {"href": a.get("href", ""), "text": []}

    def handle_endtag(self, tag):
        if not self.in_main:
            return
        if tag == "a" and self._link is not None:
            self._link["text"] = " ".join(" ".join(self._link["text"]).split())
            self.links.append(self._link)
            self._link = None
        if tag in VOID:
            return
        while self.stack:
            t, hidden = self.stack.pop()
            if hidden:
                self.hidden_depth -= 1
            if t == tag:
                break
        if tag == "main":
            self.in_main -= 1

    def handle_data(self, data):
        if not self.in_main or self.hidden_depth:
            return
        self.text.append(data)
        if self._link is not None:
            self._link["text"].append(data)


def snapshot():
    out = {}
    for name in PAGES:
        p = MainExtractor()
        p.feed((ROOT / name).read_text(encoding="utf-8"))
        words = " ".join(" ".join(p.text).split())
        out[name] = {
            "text": words,
            "images": sorted(p.images, key=lambda i: (i["src"], i["alt"] or "")),
            "links": sorted(p.links, key=lambda l: (l["href"], l["text"])),
        }
    return out


def sentences(text):
    return set(s.strip() for s in re.split(r"(?<=[.!?”\"])\s+", text) if s.strip())


def compare(base, cur):
    clean = True
    for name in PAGES:
        b, c = base[name], cur[name]
        missing = sorted(sentences(b["text"]) - sentences(c["text"]))
        added = sorted(sentences(c["text"]) - sentences(b["text"]))
        img_missing = [i for i in b["images"] if i not in c["images"]]
        img_added = [i for i in c["images"] if i not in b["images"]]
        ln_missing = [l for l in b["links"] if l not in c["links"]]
        ln_added = [l for l in c["links"] if l not in b["links"]]
        if any([missing, added, img_missing, img_added, ln_missing, ln_added]):
            clean = False
            print(f"\n== {name}")
            for label, items in [
                ("text missing", missing), ("text added", added),
                ("img missing", img_missing), ("img added", img_added),
                ("link missing", ln_missing), ("link added", ln_added),
            ]:
                for it in items:
                    print(f"  {label}: {it}")
    print("\nOK: no content differences." if clean else "\nDifferences found (review above).")
    return clean


def main():
    if "--baseline" in sys.argv:
        BASELINE.write_text(json.dumps(snapshot(), indent=1, ensure_ascii=False), encoding="utf-8")
        print(f"Baseline written: {BASELINE}")
    elif "--compare" in sys.argv:
        base = json.loads(BASELINE.read_text(encoding="utf-8"))
        sys.exit(0 if compare(base, snapshot()) else 1)
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
