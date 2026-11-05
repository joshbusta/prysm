(function () {
  "use strict";

  if (!document.body.classList.contains("page-story")) return;

  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");

  function syncChromeVars() {
    if (!header) return;
    var headerH = Math.round(header.getBoundingClientRect().height);
    if (headerH < 1) return;
    var root = document.documentElement;
    root.style.setProperty("--story-header", headerH + "px");
    document.body.style.setProperty("--story-header", headerH + "px");
  }

  syncChromeVars();
  window.addEventListener("resize", syncChromeVars);
  if (navToggle) {
    navToggle.addEventListener("change", function () {
      window.requestAnimationFrame(syncChromeVars);
    });
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncChromeVars);
  }

  var panelIds = ["beliefs", "photos", "vision", "mission", "contact"];
  var panels = panelIds
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);
  var links = Array.prototype.slice.call(
    document.querySelectorAll(".story-wayfinding a[href^='#']")
  );

  function setCurrent(id) {
    links.forEach(function (link) {
      var match = link.getAttribute("href") === "#" + id;
      if (match) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  // Current section = the last panel whose top has crossed 40% of the viewport.
  // Works for tall panels (pinned rails) where intersection ratios stay small.
  var ticking = false;

  function syncCurrent() {
    ticking = false;
    if (!panels.length) return;
    var line = window.innerHeight * 0.4;
    var current = panels[0].id;
    panels.forEach(function (panel) {
      if (panel.getBoundingClientRect().top <= line) current = panel.id;
    });
    if (window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 2) {
      current = panels[panels.length - 1].id;
    }
    setCurrent(current);
  }

  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(syncCurrent);
    },
    { passive: true }
  );
  window.addEventListener("resize", syncCurrent);
  syncCurrent();
})();
