(function () {
  "use strict";

  var menus = Array.prototype.slice.call(document.querySelectorAll("details.nav-sub"));

  function closeOthers(current) {
    menus.forEach(function (menu) {
      if (menu !== current && menu.open) menu.removeAttribute("open");
    });
  }

  function closeAll() {
    menus.forEach(function (menu) {
      if (menu.open) menu.removeAttribute("open");
    });
  }

  menus.forEach(function (menu) {
    menu.addEventListener("toggle", function () {
      if (menu.open) closeOthers(menu);
    });
  });

  document.addEventListener("click", function (event) {
    if (event.target.closest("details.nav-sub")) return;
    closeAll();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    closeAll();
    var toggle = document.getElementById("nav-toggle");
    if (toggle) toggle.checked = false;
  });
})();

(function () {
  "use strict";

  var art = document.querySelector(".hero-art");
  if (!art) return;

  var frames = Array.prototype.slice.call(art.querySelectorAll(".hero-image"));
  if (frames.length < 2) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var index = 0;
  var timer = null;
  var intervalMs = 5000;

  function show(nextIndex) {
    frames.forEach(function (frame, i) {
      var active = i === nextIndex;
      frame.classList.toggle("is-active", active);
      if (active) {
        frame.removeAttribute("aria-hidden");
      } else {
        frame.setAttribute("aria-hidden", "true");
      }
    });
    index = nextIndex;
  }

  function next() {
    show((index + 1) % frames.length);
  }

  function start() {
    if (timer || reduceMotion.matches) return;
    timer = window.setInterval(next, intervalMs);
  }

  function stop() {
    if (!timer) return;
    window.clearInterval(timer);
    timer = null;
  }

  function syncMotion() {
    if (reduceMotion.matches) {
      stop();
      show(0);
      return;
    }
    start();
  }

  show(0);
  syncMotion();

  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", syncMotion);
  } else if (typeof reduceMotion.addListener === "function") {
    reduceMotion.addListener(syncMotion);
  }
})();

(function () {
  "use strict";

  // Section entrance: content is visible by default; only animates once JS opts in.
  var items = Array.prototype.slice.call(document.querySelectorAll(".u-reveal"));
  if (!items.length || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.documentElement.classList.add("js-reveal");

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  items.forEach(function (item) {
    // Anything already on screen at load shows immediately.
    if (item.getBoundingClientRect().top < window.innerHeight) {
      item.classList.add("is-in");
    }
    observer.observe(item);
  });
})();

(function () {
  "use strict";

  var film = document.querySelector("[data-film]");
  if (!film) return;

  var frame = film.querySelector(".film-frame");
  var media = film.querySelector(".film-media");
  var button = film.querySelector(".film-play");
  if (!frame || !media || !button) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var placeholderId = "VIMEO_ID_PLACEHOLDER";
  var revealMs = 600;
  var started = false;

  function embedUrl() {
    var raw = film.getAttribute("data-vimeo-id");
    raw = raw ? raw.trim() : "";
    if (!raw || raw === placeholderId) return "";
    var base = /^https?:/i.test(raw) ? raw : "https://player.vimeo.com/video/" + encodeURIComponent(raw);
    return base + (base.indexOf("?") === -1 ? "?" : "&") + "autoplay=1&badge=0&autopause=0&title=0&byline=0&portrait=0";
  }

  function makeEmbed(url) {
    var embed = document.createElement("iframe");
    embed.className = "film-embed";
    embed.src = url;
    embed.title = "PrYSM Documentary";
    embed.setAttribute("allow", "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share");
    embed.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    frame.insertBefore(embed, frame.firstChild);
    return embed;
  }

  function finish(embed) {
    film.setAttribute("data-film-state", "playing");
    if (button.parentNode) button.parentNode.removeChild(button);
    if (media.parentNode) media.parentNode.removeChild(media);
    embed.focus();
  }

  function play() {
    if (started) return;
    started = true;

    var embed = makeEmbed(videoUrl);

    if (reduceMotion.matches) {
      finish(embed);
      return;
    }

    film.setAttribute("data-film-state", "revealing");
    window.setTimeout(function () {
      finish(embed);
    }, revealMs);
  }

  var videoUrl = embedUrl();

  // The prototype keeps the play control visible so the section still reads as a
  // film, but marks it inactive until a real Vimeo ID replaces the placeholder.
  if (!videoUrl) button.setAttribute("aria-disabled", "true");

  button.addEventListener("click", function () {
    if (!videoUrl) return;
    play();
  });
})();

/* Question accordion: animated open/close, one item open at a time.
   Without JS the native <details name> grouping still works, just unanimated.
   Height animates on .u-faq-body (clipped by CSS containment); the fade and
   slide run on .u-faq-inner so they stay on the compositor. */
(function () {
  "use strict";

  var groups = document.querySelectorAll(".u-faq");
  if (!groups.length || !Element.prototype.animate) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
  var OPEN_MS = 280;
  var CLOSE_MS = 220;
  var SHIFT = "translateY(-0.35rem)";

  Array.prototype.forEach.call(groups, function (group) {
    var items = Array.prototype.slice.call(group.querySelectorAll(".u-faq-item")).filter(function (item) {
      return item.querySelector("summary") && item.querySelector(".u-faq-body") && item.querySelector(".u-faq-inner");
    });
    if (!items.length) return;
    group.classList.add("is-enhanced");

    items.forEach(function (item) {
      // JS owns exclusivity now; the native grouping would snap siblings shut.
      item.removeAttribute("name");
      item.querySelector("summary").addEventListener("click", function (event) {
        event.preventDefault();
        toggle(item, items);
      });
    });
  });

  function isClosing(item) {
    return item.classList.contains("is-closing");
  }

  function parts(item) {
    return { body: item.querySelector(".u-faq-body"), inner: item.querySelector(".u-faq-inner") };
  }

  // Current on-screen state, including any in-flight animation.
  function snapshot(item) {
    var p = parts(item);
    return {
      height: item.open ? p.body.getBoundingClientRect().height : 0,
      opacity: item.open ? parseFloat(getComputedStyle(p.inner).opacity) : 0
    };
  }

  function stop(item) {
    var anims = item._faqAnims;
    item._faqAnims = null;
    if (!anims) return;
    anims.forEach(function (anim) {
      anim.onfinish = null;
      anim.cancel();
    });
  }

  function toggle(item, items) {
    var opening = !item.open || isClosing(item);
    var closing = opening
      ? items.filter(function (other) {
          return other !== item && other.open && !isClosing(other);
        })
      : [item];

    if (reduceMotion.matches) {
      closing.forEach(function (other) {
        stop(other);
        other.classList.remove("is-closing");
        other.open = false;
      });
      if (opening) {
        stop(item);
        item.classList.remove("is-closing");
        item.open = true;
      }
      return;
    }

    // 1. Read everything before writing anything (one layout pass, not one per item).
    var closingFrom = closing.map(snapshot);
    var openFrom = opening ? snapshot(item) : null;

    // 2. Write: stop running animations and set the opening item's state.
    closing.forEach(stop);
    if (opening) {
      stop(item);
      item.classList.remove("is-closing");
      item.open = true;
    }

    // 3. One read for the opening item's natural height, then start every animation.
    var openTo = opening ? parts(item).body.scrollHeight : 0;
    closing.forEach(function (other, i) {
      collapse(other, closingFrom[i]);
    });
    if (opening) expand(item, openFrom, openTo);
  }

  function expand(item, from, to) {
    var p = parts(item);
    var timing = { duration: OPEN_MS, easing: EASE };
    item._faqAnims = [
      p.body.animate([{ height: from.height + "px" }, { height: to + "px" }], timing),
      p.inner.animate(
        [
          { opacity: from.opacity, transform: from.opacity > 0 ? "none" : SHIFT },
          { opacity: 1, transform: "none", offset: 0.6 },
          { opacity: 1, transform: "none" }
        ],
        timing
      )
    ];
    item._faqAnims[0].onfinish = function () {
      stop(item);
    };
  }

  function collapse(item, from) {
    var p = parts(item);
    item.classList.add("is-closing");
    // fill: forwards holds the closed frame until `open` flips, so the
    // answer never flashes back to full height for a frame.
    var timing = { duration: CLOSE_MS, easing: EASE, fill: "forwards" };
    item._faqAnims = [
      p.body.animate([{ height: from.height + "px" }, { height: "0px" }], timing),
      p.inner.animate(
        [
          { opacity: from.opacity, transform: "none" },
          { opacity: 0, transform: SHIFT, offset: 0.5 },
          { opacity: 0, transform: SHIFT }
        ],
        timing
      )
    ];
    item._faqAnims[0].onfinish = function () {
      item.open = false;
      item.classList.remove("is-closing");
      stop(item);
    };
  }
})();

/* Site header: pinned on every page. Publishes its height as --header-h (anchor
   offsets, Our Story panels, pinned rails) and frosts once content scrolls
   beneath it. */
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  if (!header) return;
  var root = document.documentElement;
  var navToggle = header.querySelector(".nav-toggle");

  function measure() {
    // An open mobile menu makes the header temporarily tall; keep the last
    // closed height so page layout doesn't jump.
    if (navToggle && navToggle.checked) return;
    var h = Math.round(header.getBoundingClientRect().height);
    if (h > 0) root.style.setProperty("--header-h", h + "px");
  }

  measure();
  window.addEventListener("resize", measure);
  if (navToggle) {
    navToggle.addEventListener("change", function () {
      window.requestAnimationFrame(measure);
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  var scrolled = null;
  var ticking = false;
  function syncScrolled() {
    ticking = false;
    var next = window.pageYOffset > 4;
    if (next === scrolled) return;
    scrolled = next;
    header.classList.toggle("is-scrolled", next);
  }
  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(syncScrolled);
    },
    { passive: true }
  );
  syncScrolled();
})();
