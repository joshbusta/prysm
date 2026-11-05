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
})();
