const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = path.join(__dirname, "..");
const BASE = "http://127.0.0.1:8000";

async function measure(page) {
  return page.evaluate(() => {
    const header = document.querySelector(".site-header");
    const title = document.querySelector(".story-title-bar");
    const panels = Array.from(document.querySelectorAll(".story-panel")).map(
      (el) => ({
        id: el.id,
        height: Math.round(el.getBoundingClientRect().height),
        top: Math.round(el.getBoundingClientRect().top),
        scrollSnapAlign: getComputedStyle(el).scrollSnapAlign,
        scrollSnapStop: getComputedStyle(el).scrollSnapStop
      })
    );
    const htmlStyle = getComputedStyle(document.documentElement);
    const bodyStyle = getComputedStyle(document.body);
    const beliefs = document.querySelector(".beliefs");
    const vision = document.querySelector(".story-vision-layout");
    const mission = document.querySelector(".story-mission-layout");
    const photos = document.querySelector(".story-photos-layout");
    const carouselViewport = document.querySelector(
      ".story-panel--photos .shard-carousel-viewport"
    );
    const filmstrip = document.querySelector(".story-filmstrip");
    const wayfinding = document.querySelector(".story-wayfinding");
    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      headerH: header ? Math.round(header.getBoundingClientRect().height) : null,
      titleH: title ? Math.round(title.getBoundingClientRect().height) : null,
      headerTop: header ? Math.round(header.getBoundingClientRect().top) : null,
      titleTop: title ? Math.round(title.getBoundingClientRect().top) : null,
      cssVars: {
        storyHeader: bodyStyle.getPropertyValue("--story-header").trim(),
        storyTitle: bodyStyle.getPropertyValue("--story-title").trim(),
        htmlSnap: htmlStyle.scrollSnapType,
        htmlPad: htmlStyle.scrollPaddingTop,
        htmlBehavior: htmlStyle.scrollBehavior
      },
      panels,
      beliefsDisplay: beliefs ? getComputedStyle(beliefs).display : null,
      beliefsCols: beliefs
        ? getComputedStyle(beliefs).gridTemplateColumns
        : null,
      visionDisplay: vision ? getComputedStyle(vision).display : null,
      visionCols: vision ? getComputedStyle(vision).gridTemplateColumns : null,
      missionDisplay: mission ? getComputedStyle(mission).display : null,
      missionCols: mission
        ? getComputedStyle(mission).gridTemplateColumns
        : null,
      photosDisplay: photos ? getComputedStyle(photos).display : null,
      photosCols: photos ? getComputedStyle(photos).gridTemplateColumns : null,
      carouselViewportH: carouselViewport
        ? Math.round(carouselViewport.getBoundingClientRect().height)
        : null,
      filmstripDisplay: filmstrip ? getComputedStyle(filmstrip).display : null,
      wayfindingDisplay: wayfinding
        ? getComputedStyle(wayfinding).display
        : null,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      pageYOffset: window.scrollY,
      footerSnap: getComputedStyle(document.querySelector(".site-footer"))
        .scrollSnapAlign
    };
  });
}

async function runViewport(browser, width, height, label) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(`${BASE}/our-story.html`, {
    waitUntil: "networkidle0",
    timeout: 30000
  });
  await page.waitForSelector(".story-panel");
  await new Promise((r) => setTimeout(r, 400));

  const before = await measure(page);
  await page.screenshot({
    path: path.join(OUT, `${label}-top.png`),
    fullPage: false
  });

  // scroll to next panels
  const panelTops = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".story-panel")).map((el) => ({
      id: el.id,
      top: el.offsetTop
    }))
  );

  for (const p of panelTops) {
    await page.evaluate((y) => window.scrollTo(0, y), p.top);
    await new Promise((r) => setTimeout(r, 350));
    await page.screenshot({
      path: path.join(OUT, `${label}-${p.id}.png`),
      fullPage: false
    });
  }

  // footer
  await page.evaluate(() => {
    const f = document.querySelector(".site-footer");
    if (f) f.scrollIntoView({ block: "start" });
  });
  await new Promise((r) => setTimeout(r, 350));
  await page.screenshot({
    path: path.join(OUT, `${label}-footer.png`),
    fullPage: false
  });

  // mobile nav open check
  let navOpen = null;
  if (width < 1024) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.click(".nav-toggle-label");
    await new Promise((r) => setTimeout(r, 200));
    navOpen = await page.evaluate(() => {
      const nav = document.querySelector(".site-nav");
      return nav ? getComputedStyle(nav).display : null;
    });
    await page.screenshot({
      path: path.join(OUT, `${label}-nav-open.png`),
      fullPage: false
    });
  }

  // carousel next
  await page.evaluate(() => window.scrollTo(0, document.getElementById("photos").offsetTop));
  await new Promise((r) => setTimeout(r, 300));
  const statusBefore = await page.$eval(".shard-carousel-status", (el) => el.textContent);
  await page.click(".shard-carousel-next");
  await new Promise((r) => setTimeout(r, 400));
  const statusAfter = await page.$eval(".shard-carousel-status", (el) => el.textContent);

  // reduced motion spot
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" }
  ]);
  await page.reload({ waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 300));
  const reduced = await page.evaluate(() => {
    const body = document.querySelector(".story-panel-body");
    const cs = getComputedStyle(body);
    return {
      animationName: cs.animationName,
      opacity: cs.opacity,
      transform: cs.transform,
      snap: getComputedStyle(document.documentElement).scrollSnapType
    };
  });

  await page.close();
  return { before, navOpen, statusBefore, statusAfter, reduced, panelTops };
}

async function checkOtherPage(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 800 });
  await page.goto(`${BASE}/index.html`, {
    waitUntil: "networkidle0",
    timeout: 30000
  });
  const info = await page.evaluate(() => {
    const html = getComputedStyle(document.documentElement);
    const card = document.querySelector(".card");
    return {
      snap: html.scrollSnapType,
      pad: html.scrollPaddingTop,
      bodyClass: document.body.className,
      cardPadding: card ? getComputedStyle(card).padding : null,
      cardBg: card ? getComputedStyle(card).backgroundColor : null
    };
  });
  await page.screenshot({
    path: path.join(OUT, "other-index.png"),
    fullPage: false
  });
  await page.close();
  return info;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"]
  });

  const mobile = await runViewport(browser, 390, 844, "m390");
  const desktop = await runViewport(browser, 1100, 800, "d1100");
  const other = await checkOtherPage(browser);

  const report = { mobile, desktop, other };
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
