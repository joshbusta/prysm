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
    return base + (base.indexOf("?") === -1 ? "?" : "&") + "autoplay=1&title=0&byline=0&portrait=0";
  }

  function makeEmbed(url) {
    var embed = document.createElement("iframe");
    embed.className = "film-embed";
    embed.src = url;
    embed.title = "PrYSM Documentary";
    embed.setAttribute("allow", "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media");
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
