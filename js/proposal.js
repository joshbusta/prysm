(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var saveData = navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || ""));

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function payload(obj) {
    obj.consent_at = obj.consent_at || new Date().toISOString();
    obj.source = window.location.pathname.split("/").pop() || "index.html";
    return JSON.stringify(obj, null, 2);
  }

  function showStatus(el, kind, text) {
    if (!el) return;
    el.className = "form-status is-" + kind;
    el.textContent = text;
    el.hidden = false;
  }

  function revealPayload(pre, data) {
    if (!pre) return;
    pre.hidden = false;
    pre.textContent = payload(data);
  }

  /* ------------------------------------------------------------------ */
  /* Offline                                                            */
  /* ------------------------------------------------------------------ */

  $$("[data-offline]").forEach(function (banner) {
    function sync() {
      var off = !navigator.onLine;
      banner.hidden = !off;
      banner.classList.toggle("is-offline", off);
    }
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    sync();
    if (window.location.search.indexOf("state=offline") !== -1) {
      banner.hidden = false;
      banner.classList.add("is-offline");
    }
  });

  /* ------------------------------------------------------------------ */
  /* Prism Compass                                                      */
  /* ------------------------------------------------------------------ */

  $$("[data-prism-compass]").forEach(function (root) {
    var stage = $(".prism-stage", root);
    var object = $(".prism-object", root);
    var actions = $$(".prism-action", root);
    var loadBtn = $(".prism-load", root);
    var index = 0;
    var angle = -18;
    var dragging = false;
    var startX = 0;
    var startAngle = 0;

    function setIndex(next) {
      index = (next + actions.length) % actions.length;
      actions.forEach(function (action, i) {
        action.classList.toggle("is-lit", i === index);
      });
      angle = -18 + index * -90;
      if (object) object.style.setProperty("--ry", angle + "deg");
    }

    function can3d() {
      return !reduceMotion.matches && !saveData;
    }

    if (!can3d() && stage) stage.hidden = true;

    if (stage && object && can3d()) {
      stage.addEventListener("pointerdown", function (event) {
        dragging = true;
        startX = event.clientX;
        startAngle = angle;
        stage.classList.add("is-dragging");
        stage.setPointerCapture(event.pointerId);
      });
      stage.addEventListener("pointermove", function (event) {
        if (!dragging) return;
        var delta = event.clientX - startX;
        angle = startAngle + delta * 0.45;
        object.style.setProperty("--ry", angle + "deg");
      });
      function endDrag() {
        if (!dragging) return;
        dragging = false;
        stage.classList.remove("is-dragging");
        var snapped = Math.round((angle + 18) / -90);
        setIndex(snapped);
      }
      stage.addEventListener("pointerup", endDrag);
      stage.addEventListener("pointercancel", endDrag);
    }

    actions.forEach(function (action, i) {
      action.addEventListener("focus", function () {
        setIndex(i);
      });
    });

    if (loadBtn) {
      if (!can3d()) {
        loadBtn.hidden = true;
      }
      loadBtn.addEventListener("click", function () {
        root.setAttribute("data-spline-loaded", "true");
        loadBtn.textContent = "3D scene ready (CSS stand-in)";
        loadBtn.disabled = true;
      });
    }

    setIndex(0);
  });

  /* ------------------------------------------------------------------ */
  /* /links sheets                                                      */
  /* ------------------------------------------------------------------ */

  $$("[data-open-sheet]").forEach(function (trigger) {
    trigger.addEventListener("click", function (event) {
      var id = trigger.getAttribute("data-open-sheet");
      var sheet = id ? document.getElementById(id) : null;
      if (!sheet) return;
      event.preventDefault();
      $$(".sheet").forEach(function (node) {
        node.classList.toggle("is-open", node === sheet);
      });
      sheet.scrollIntoView({ block: "nearest" });
      var first = $("input, button, textarea", sheet);
      if (first) first.focus();
    });
  });

  /* ------------------------------------------------------------------ */
  /* Spectrum bands                                                     */
  /* ------------------------------------------------------------------ */

  $$(".spectrum-band").forEach(function (band) {
    var btn = $("button", band);
    if (!btn) return;
    btn.addEventListener("click", function () {
      var muted = band.classList.toggle("is-muted");
      btn.textContent = muted ? "Muted" : "On";
      btn.setAttribute("aria-pressed", muted ? "false" : "true");
    });
  });

  function channelState(scope) {
    var out = { sms: true, whatsapp: true, email: true };
    $$(".spectrum-band", scope).forEach(function (band) {
      var key = band.getAttribute("data-channel");
      if (key) out[key] = !band.classList.contains("is-muted");
    });
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* Register wizard                                                    */
  /* ------------------------------------------------------------------ */

  $$("[data-wizard]").forEach(function (form) {
    var panes = $$(".wizard-pane", form);
    var dots = $$(".step-dots span", form);
    var status = $("[data-status]", form);
    var pre = $("pre", form);
    var step = 0;
    var params = new URLSearchParams(window.location.search);

    function show(i) {
      step = i;
      panes.forEach(function (pane, idx) {
        pane.hidden = idx !== step;
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-on", idx <= step);
      });
    }

    form.addEventListener("click", function (event) {
      var next = event.target.closest("[data-next]");
      var back = event.target.closest("[data-back]");
      if (next) {
        event.preventDefault();
        if (step === 0) {
          var name = $("#reg-name", form);
          var email = $("#reg-email", form);
          if (!name.value.trim() || !email.value.trim()) {
            showStatus(status, "error", "Name and email are required.");
            return;
          }
          status.className = "form-status";
          status.textContent = "";
        }
        show(Math.min(step + 1, panes.length - 1));
      }
      if (back) {
        event.preventDefault();
        show(Math.max(step - 1, 0));
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var channels = channelState(form);
      showStatus(status, "success", "You’re in. Payload queued for Airtable / EveryAction.");
      revealPayload(pre, {
        form_type: "register",
        name: ($("#reg-name", form) || {}).value,
        email: ($("#reg-email", form) || {}).value,
        phone: ($("#reg-phone", form) || {}).value || null,
        channel_sms: channels.sms,
        channel_whatsapp: channels.whatsapp,
        channel_email: channels.email
      });
      show(panes.length - 1);
    });

    if (params.get("state") === "error") {
      showStatus(status, "error", "Name and email are required.");
    }
    if (params.get("state") === "success") {
      show(panes.length - 1);
      showStatus(status, "success", "You’re in. Payload queued for Airtable / EveryAction.");
    } else {
      show(0);
    }
  });

  /* ------------------------------------------------------------------ */
  /* Mock forms (login, rsvp, mutual aid, newsletter, comms)            */
  /* ------------------------------------------------------------------ */

  $$("[data-mock-form]").forEach(function (form) {
    var status = $("[data-status]", form);
    var pre = $("pre", form);
    var kind = form.getAttribute("data-mock-form");
    var params = new URLSearchParams(window.location.search);
    var nextField = $("input[name=next]", form);
    if (nextField && params.get("next")) nextField.value = params.get("next");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = { form_type: kind };
      $$("input, textarea, select", form).forEach(function (field) {
        if (!field.name) return;
        if (field.type === "checkbox") data[field.name] = field.checked;
        else data[field.name] = field.value;
      });
      var requested = data.next || params.get("next") || "portal-events.html";
      var nextUrl = /^[a-z0-9._-]+\.html$/i.test(requested) ? requested : "portal-events.html";
      if (kind === "login-magic") {
        if (!data.email) {
          showStatus(status, "error", "Enter the email on your membership.");
          return;
        }
        showStatus(status, "success", "Magic link sent. Check your email — it expires in 15 minutes.");
        revealPayload(pre, data);
        var hop = $("[data-after-login]", form);
        if (hop) {
          hop.hidden = false;
          hop.href = nextUrl;
          hop.parentNode.hidden = false;
        }
        return;
      }
      if (kind === "login-password") {
        if (!data.email || !data.password) {
          showStatus(status, "error", "Email and password are required.");
          return;
        }
        window.location.href = nextUrl;
        return;
      }
      if (kind === "rsvp" && !data.name) {
        showStatus(status, "error", "Add your name so we can hold a seat.");
        return;
      }
      if (kind === "mutual-aid" && !data.need) {
        showStatus(status, "error", "Tell us what you need, even in a few words.");
        return;
      }
      var channels = channelState(form);
      if (Object.keys(channels).length) {
        data.channel_sms = channels.sms;
        data.channel_whatsapp = channels.whatsapp;
        data.channel_email = channels.email;
      }
      showStatus(status, "success", "Got it. Staff will see this in Airtable / EveryAction — no re-typing.");
      revealPayload(pre, data);
    });

    if (params.get("state") === "error") {
      showStatus(status, "error", "Check the highlighted fields and try again.");
    }
    if (params.get("state") === "success") {
      showStatus(status, "success", "Saved. Webhook queued.");
    }
  });

  var passwordToggle = $("[data-show-password]");
  if (passwordToggle) {
    passwordToggle.addEventListener("click", function () {
      var pane = $("#password-pane");
      if (!pane) return;
      pane.hidden = !pane.hidden;
      passwordToggle.textContent = pane.hidden ? "Use a password instead" : "Hide password login";
    });
  }

  /* ------------------------------------------------------------------ */
  /* Shift Glass                                                        */
  /* ------------------------------------------------------------------ */

  var toast = $("[data-confirm]");
  var pending = null;

  function askConfirm(message, onYes) {
    if (!toast) {
      onYes();
      return;
    }
    pending = onYes;
    $("[data-confirm-copy]", toast).textContent = message;
    toast.classList.add("is-open");
  }

  if (toast) {
    toast.addEventListener("click", function (event) {
      if (event.target.closest("[data-confirm-yes]") && pending) {
        pending();
        pending = null;
        toast.classList.remove("is-open");
      }
      if (event.target.closest("[data-confirm-no]")) {
        pending = null;
        toast.classList.remove("is-open");
      }
    });
  }

  $$("[data-shift-card]").forEach(function (card) {
    var startX = 0;
    var startY = 0;
    var tracking = false;
    var pressTimer = null;
    var rsvpBtn = $("[data-rsvp]", card);
    var shiftsBtn = $("[data-shifts]", card);

    function rsvp() {
      askConfirm("Hold this RSVP for " + (card.getAttribute("data-title") || "this event") + "?", function () {
        card.classList.add("is-rsvp");
        var status = $("[data-card-status]", card);
        if (status) status.textContent = "You’re in. Location stays in the portal.";
        var pre = $("pre", card);
        revealPayload(pre, {
          form_type: "event_rsvp",
          event_id: card.getAttribute("data-event-id"),
          shift_id: null
        });
      });
    }

    function toggleShifts() {
      card.classList.toggle("is-open");
    }

    if (rsvpBtn) rsvpBtn.addEventListener("click", rsvp);
    if (shiftsBtn) shiftsBtn.addEventListener("click", toggleShifts);

    $$(".shift-band", card).forEach(function (band) {
      band.addEventListener("click", function () {
        if (band.getAttribute("data-fullness") === "full") return;
        askConfirm("Sign up for " + band.getAttribute("data-shift-label") + "?", function () {
          var pre = $("pre", card);
          revealPayload(pre, {
            form_type: "shift_signup",
            event_id: card.getAttribute("data-event-id"),
            shift_id: band.getAttribute("data-shift-id")
          });
          var status = $("[data-card-status]", card);
          if (status) status.textContent = "Shift saved. We’ll text only on channels you left on.";
        });
      });
    });

    card.addEventListener("pointerdown", function (event) {
      tracking = true;
      startX = event.clientX;
      startY = event.clientY;
      pressTimer = window.setTimeout(function () {
        pressTimer = null;
        rsvp();
      }, 520);
    });

    card.addEventListener("pointermove", function (event) {
      if (!tracking) return;
      var dx = event.clientX - startX;
      var dy = event.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 12 && pressTimer) {
        window.clearTimeout(pressTimer);
        pressTimer = null;
      }
    });

    function endPointer(event) {
      if (!tracking) return;
      tracking = false;
      if (pressTimer) {
        window.clearTimeout(pressTimer);
        pressTimer = null;
      }
      var dx = event.clientX - startX;
      var dy = event.clientY - startY;
      if (dx > 72 && Math.abs(dx) > Math.abs(dy)) rsvp();
      else if (dy < -56 && Math.abs(dy) > Math.abs(dx)) card.classList.add("is-open");
    }

    card.addEventListener("pointerup", endPointer);
    card.addEventListener("pointercancel", function () {
      tracking = false;
      if (pressTimer) window.clearTimeout(pressTimer);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Groundlight overlay                                                */
  /* ------------------------------------------------------------------ */

  var overlay = $("[data-story]");
  $$("[data-story-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!overlay) return;
      var img = $("img", overlay);
      var cap = $("figcaption", overlay);
      if (img) img.src = btn.getAttribute("data-src") || btn.querySelector("img").src;
      if (cap) cap.textContent = btn.getAttribute("data-caption") || "";
      overlay.classList.add("is-open");
    });
  });
  if (overlay) {
    overlay.addEventListener("click", function (event) {
      if (event.target.closest("[data-story-close]") || event.target === overlay) {
        overlay.classList.remove("is-open");
      }
    });
  }

  var auth = new URLSearchParams(window.location.search).get("auth");
  if (auth === "out") {
    $$("[data-gate=in]").forEach(function (node) { node.hidden = true; });
    $$("[data-gate=out]").forEach(function (node) { node.hidden = false; });
    $$("[data-session=in]").forEach(function (node) { node.hidden = true; });
    $$("[data-session=out]").forEach(function (node) { node.hidden = false; });
  }

  $$("[data-facet-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$("[data-facet-filter]").forEach(function (el) {
        el.classList.toggle("is-on", el === btn);
      });
      var tag = btn.getAttribute("data-facet-filter");
      $$("[data-story-open]").forEach(function (item) {
        var tags = (item.getAttribute("data-tags") || "").split(",");
        item.hidden = tag !== "all" && tags.indexOf(tag) === -1;
      });
    });
  });
})();
