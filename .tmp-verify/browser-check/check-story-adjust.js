const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = path.join(__dirname, "..");
const BASE = "http://127.0.0.1:8000";

async function checkStory(page, label) {
  await page.goto(`${BASE}/our-story.html`, {
    waitUntil: "networkidle0",
    timeout: 30000
  });
  await page.waitForSelector("#story-heading");
  await new Promise((r) => setTimeout(r, 500));

  const top = await page.evaluate(() => {
    const header = document.querySelector(".site-header");
    const titleBar = document.querySelector(".story-title-bar");
    const h1 = document.querySelector("#story-heading");
    const beliefs = document.querySelector("#beliefs");
    const html = getComputedStyle(document.documentElement);
    const body = getComputedStyle(document.body);
    const headerRect = header.getBoundingClientRect();
    const h1Rect = h1.getBoundingClientRect();
    const h1Style = getComputedStyle(h1);
    const way = document.querySelector(".story-wayfinding");
    const marks = Array.from(
      document.querySelectorAll(".story-wayfinding-mark")
    ).map((el) => {
      const r = el.getBoundingClientRect();
      return { top: Math.round(r.top), mid: Math.round(r.top + r.height / 2) };
    });
    const thumbs = Array.from(
      document.querySelectorAll(".story-filmstrip [data-story-thumb]")
    ).map((el) => ({
      tag: el.tagName,
      type: el.getAttribute("type"),
      label: el.getAttribute("aria-label"),
      pressed: el.getAttribute("aria-pressed"),
      current: el.classList.contains("is-current")
    }));
    const filmDisplay = getComputedStyle(
      document.querySelector(".story-filmstrip")
    ).display;

    // scrollbar visibility heuristics
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const scrollbarWidthCss = html.scrollbarWidth;

    return {
      hasTitleBar: !!titleBar,
      h1InBeliefs: beliefs.contains(h1),
      h1Text: h1.textContent.trim(),
      h1FontSize: h1Style.fontSize,
      h1FontFamily: h1Style.fontFamily,
      h1FontWeight: h1Style.fontWeight,
      h1LetterSpacing: h1Style.letterSpacing,
      h1Color: h1Style.color,
      h1Position: h1Style.position,
      h1Top: Math.round(h1Rect.top),
      h1Left: Math.round(h1Rect.left),
      headerH: Math.round(headerRect.height),
      headerSticky: getComputedStyle(header).position,
      cssHeader: body.getPropertyValue("--story-header").trim(),
      cssTitle: body.getPropertyValue("--story-title").trim(),
      scrollPad: html.scrollPaddingTop,
      snap: html.scrollSnapType,
      scrollbarWidth,
      scrollbarWidthCss,
      wayDisplay: way ? getComputedStyle(way).display : null,
      wayTop: way ? Math.round(way.getBoundingClientRect().top) : null,
      wayBottom: way ? Math.round(way.getBoundingClientRect().bottom) : null,
      marks,
      filmDisplay,
      thumbs,
      panelMinH: getComputedStyle(beliefs).minHeight,
      ariaLabelledby: beliefs.getAttribute("aria-labelledby"),
      beliefsFirstLineTop: (() => {
        const p = beliefs.querySelector(".beliefs p");
        return p ? Math.round(p.getBoundingClientRect().top) : null;
      })()
    };
  });

  await page.screenshot({
    path: path.join(OUT, `${label}-beliefs.png`),
    fullPage: false
  });

  // Scroll to photos — title should leave viewport
  await page.evaluate(() => {
    document.getElementById("photos").scrollIntoView({ block: "start" });
  });
  await new Promise((r) => setTimeout(r, 400));

  const afterScroll = await page.evaluate(() => {
    const h1 = document.querySelector("#story-heading");
    const r = h1.getBoundingClientRect();
    const header = document.querySelector(".site-header");
    const photos = document.getElementById("photos");
    const pr = photos.getBoundingClientRect();
    return {
      h1Top: Math.round(r.top),
      h1Bottom: Math.round(r.bottom),
      h1InView: r.bottom > 0 && r.top < window.innerHeight,
      headerStickyTop: Math.round(header.getBoundingClientRect().top),
      photosTop: Math.round(pr.top),
      status: document.querySelector(".shard-carousel-status").textContent
    };
  });

  await page.screenshot({
    path: path.join(OUT, `${label}-photos.png`),
    fullPage: false
  });

  // Filmstrip click (desktop only when visible)
  let filmstripClick = null;
  if (top.filmDisplay !== "none" && top.thumbs.length) {
    const status0 = await page.$eval(
      ".shard-carousel-status",
      (el) => el.textContent
    );
    await page.click('.story-filmstrip [data-story-thumb="2"]');
    await new Promise((r) => setTimeout(r, 300));
    filmstripClick = await page.evaluate(() => {
      const status = document.querySelector(".shard-carousel-status").textContent;
      const active = document.querySelector(
        ".shard-carousel-viewport > .media-shard.is-active img"
      );
      const thumbs = Array.from(
        document.querySelectorAll(".story-filmstrip [data-story-thumb]")
      ).map((el) => ({
        i: el.getAttribute("data-story-thumb"),
        current: el.classList.contains("is-current"),
        pressed: el.getAttribute("aria-pressed")
      }));
      return {
        status,
        activeAlt: active ? active.getAttribute("alt") : null,
        thumbs
      };
    });
    filmstripClick.status0 = status0;

    // prev/next still work
    await page.click(".shard-carousel-next");
    await new Promise((r) => setTimeout(r, 250));
    const afterNext = await page.$eval(
      ".shard-carousel-status",
      (el) => el.textContent
    );
    await page.click(".shard-carousel-prev");
    await new Promise((r) => setTimeout(r, 250));
    const afterPrev = await page.$eval(
      ".shard-carousel-status",
      (el) => el.textContent
    );
    filmstripClick.afterNext = afterNext;
    filmstripClick.afterPrev = afterPrev;
  }

  // Wayfinding spacing when visible
  let waySpacing = null;
  if (top.wayDisplay === "block" && top.marks.length >= 4) {
    const mids = top.marks.map((m) => m.mid);
    const gaps = [];
    for (let i = 1; i < mids.length; i++) gaps.push(mids[i] - mids[i - 1]);
    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const maxDev = Math.max(...gaps.map((g) => Math.abs(g - avg)));
    waySpacing = {
      mids,
      gaps,
      avg: Math.round(avg),
      maxDev: Math.round(maxDev),
      viewportH: await page.evaluate(() => window.innerHeight),
      headerH: top.headerH,
      firstNearTop: mids[0] - top.headerH,
      lastNearBottom: await page.evaluate(
        (last) => window.innerHeight - last,
        mids[mids.length - 1]
      )
    };
  }

  return { top, afterScroll, filmstripClick, waySpacing };
}

async function checkOther(page) {
  await page.goto(`${BASE}/index.html`, {
    waitUntil: "networkidle0",
    timeout: 30000
  });
  return page.evaluate(() => {
    const html = getComputedStyle(document.documentElement);
    return {
      snap: html.scrollSnapType,
      scrollbarWidthCss: html.scrollbarWidth,
      bodyClass: document.body.className,
      // if scrollbar present, innerWidth - clientWidth often > 0 on some OS;
      // also check that we did NOT set scrollbar-width: none
      overflowY: html.overflowY
    };
  });
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  const mobile = await checkStory(page, "v390");

  await page.setViewport({ width: 1100, height: 800, deviceScaleFactor: 1 });
  const desktop = await checkStory(page, "v1100");

  const other = await checkOther(page);

  const report = { mobile, desktop, other };
  fs.writeFileSync(
    path.join(OUT, "story-adjust-report.json"),
    JSON.stringify(report, null, 2)
  );
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
