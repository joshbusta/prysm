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

  if (panels.length && "IntersectionObserver" in window) {
    var ratios = {};
    panels.forEach(function (panel) {
      ratios[panel.id] = 0;
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          ratios[entry.target.id] = entry.intersectionRatio;
        });
        var bestId = null;
        var bestRatio = 0;
        panelIds.forEach(function (id) {
          if (ratios[id] > bestRatio) {
            bestRatio = ratios[id];
            bestId = id;
          }
        });
        if (bestId) setCurrent(bestId);
      },
      {
        threshold: [0.15, 0.35, 0.55, 0.75],
        rootMargin: "-20% 0px -35% 0px"
      }
    );

    panels.forEach(function (panel) {
      observer.observe(panel);
    });
  }

  var carousel = document.querySelector(
    ".story-panel--photos .shard-carousel"
  );
  var thumbs = Array.prototype.slice.call(
    document.querySelectorAll(".story-filmstrip [data-story-thumb]")
  );

  function syncFilmstrip() {
    if (!carousel || !thumbs.length) return;
    var slides = Array.prototype.slice.call(
      carousel.querySelectorAll(".shard-carousel-viewport > .media-shard")
    );
    slides.forEach(function (slide, i) {
      if (!thumbs[i]) return;
      var current = slide.classList.contains("is-active");
      thumbs[i].classList.toggle("is-current", current);
      if (thumbs[i].hasAttribute("aria-pressed")) {
        thumbs[i].setAttribute("aria-pressed", current ? "true" : "false");
      }
    });
  }

  if (carousel && thumbs.length) {
    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var raw = thumb.getAttribute("data-story-thumb");
        var target = parseInt(raw, 10);
        if (isNaN(target)) return;
        if (typeof carousel.goToSlide === "function") {
          carousel.goToSlide(target);
        }
      });
    });

    if ("MutationObserver" in window) {
      syncFilmstrip();
      var mo = new MutationObserver(syncFilmstrip);
      mo.observe(carousel, {
        subtree: true,
        attributes: true,
        attributeFilter: ["class"]
      });
    }
  }
})();
