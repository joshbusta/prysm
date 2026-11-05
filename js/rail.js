/*
 * Pinned horizontal rail.
 *
 * Markup: section.u-rail > .u-rail-sticky > (.u-rail-head, .u-rail-track > .u-rail-card…)
 * At >= 64rem with motion allowed, the section grows by the track's overflow, the
 * sticky block pins under the header, and vertical scroll translates the track
 * 1:1. Otherwise (narrow, reduced motion, no JS, or a card too tall to pin) the
 * cards stay stacked in source order.
 */
(function () {
  "use strict";

  var rails = Array.prototype.slice.call(document.querySelectorAll(".u-rail"));
  if (!rails.length) return;

  var wide = window.matchMedia("(min-width: 64rem)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var ticking = false;

  function railTop() {
    var v = parseFloat(getComputedStyle(document.body).getPropertyValue("--story-header"));
    return document.body.classList.contains("page-story") && !isNaN(v) ? v : 0;
  }

  function state(rail) {
    if (!rail._rail) {
      rail._rail = {
        sticky: rail.querySelector(".u-rail-sticky"),
        track: rail.querySelector(".u-rail-track"),
        overflow: 0
      };
    }
    return rail._rail;
  }

  function unpin(rail) {
    var s = state(rail);
    rail.classList.remove("is-pinned");
    rail.style.height = "";
    if (s.track) s.track.style.transform = "";
    s.overflow = 0;
  }

  function measure(rail) {
    var s = state(rail);
    if (!s.sticky || !s.track) return;
    if (!wide.matches || reduce.matches) {
      unpin(rail);
      return;
    }

    // Keep the current height while measuring so the document never shrinks
    // (shrinking would clamp the reader's scroll position).
    rail.classList.add("is-pinned");
    var viewportW = s.sticky.clientWidth;
    var overflow = Math.ceil(s.track.scrollWidth - viewportW);
    var fits = s.sticky.offsetHeight <= window.innerHeight - railTop();

    if (overflow <= 0 || !fits) {
      unpin(rail);
      return;
    }
    s.overflow = overflow;
    rail.style.height = s.sticky.offsetHeight + overflow + "px";
    update(rail);
  }

  function update(rail) {
    var s = state(rail);
    if (!s.overflow) return;
    var progress = railTop() - rail.getBoundingClientRect().top;
    progress = Math.max(0, Math.min(s.overflow, progress));
    s.track.style.transform = "translate3d(" + -progress + "px, 0, 0)";
  }

  function measureAll() {
    rails.forEach(measure);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      rails.forEach(update);
      ticking = false;
    });
  }

  // Keyboard: bring a focused card into view by scrolling to its offset.
  rails.forEach(function (rail) {
    rail.addEventListener("focusin", function (event) {
      var s = state(rail);
      if (!s.overflow) return;
      var card = event.target.closest(".u-rail-card");
      if (!card) return;
      var target = Math.max(0, Math.min(s.overflow, card.offsetLeft - 24));
      var railDocTop = rail.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo(0, railDocTop - railTop() + target);
      // Undo any horizontal scroll the browser applied to reveal the focus.
      s.sticky.scrollLeft = 0;
    });
  });

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(measureAll, 120);
  });
  window.addEventListener("scroll", onScroll, { passive: true });

  [wide, reduce].forEach(function (mq) {
    if (typeof mq.addEventListener === "function") mq.addEventListener("change", measureAll);
    else if (typeof mq.addListener === "function") mq.addListener(measureAll);
  });

  measureAll();
  window.addEventListener("load", measureAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureAll);
})();
