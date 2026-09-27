(function () {
  "use strict";

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
      showStatus(status, "success", "Got it. Staff will see this in Airtable / EveryAction.");
      revealPayload(pre, data);
    });

    if (params.get("state") === "error") {
      showStatus(status, "error", "Check the highlighted fields and try again.");
    }
    if (params.get("state") === "success") {
      showStatus(status, "success", "Saved. Webhook queued.");
    }
  });

  /* ------------------------------------------------------------------ */
  /* Shift Glass                                                        */
  /* ------------------------------------------------------------------ */

  var toast = $("[data-confirm]");
  var pending = null;
  var lastFocus = null;

  function closeConfirm() {
    pending = null;
    if (toast) toast.classList.remove("is-open");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    lastFocus = null;
  }

  function askConfirm(message, onYes) {
    if (!toast) {
      onYes();
      return;
    }
    pending = onYes;
    lastFocus = document.activeElement;
    $("[data-confirm-copy]", toast).textContent = message;
    toast.classList.add("is-open");
    var yes = $("[data-confirm-yes]", toast);
    if (yes) yes.focus();
  }

  if (toast) {
    toast.addEventListener("click", function (event) {
      if (event.target.closest("[data-confirm-yes]") && pending) {
        var done = pending;
        pending = null;
        toast.classList.remove("is-open");
        if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
        lastFocus = null;
        done();
        return;
      }
      if (event.target === toast || event.target.closest("[data-confirm-no]")) {
        closeConfirm();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (!toast || !toast.classList.contains("is-open")) return;
    event.preventDefault();
    closeConfirm();
  });

  $$("[data-shift-card]").forEach(function (card) {
    var rsvpBtn = $("[data-rsvp]", card);
    var shiftsBtn = $("[data-shifts]", card);

    function rsvp() {
      askConfirm("Hold this RSVP for " + (card.getAttribute("data-title") || "this event") + "?", function () {
        card.classList.add("is-rsvp");
        var status = $("[data-card-status]", card);
        if (status) status.textContent = "You RSVPed!";
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
  });

  var auth = new URLSearchParams(window.location.search).get("auth");
  if (auth === "out") {
    $$("[data-gate=in]").forEach(function (node) { node.hidden = true; });
    $$("[data-gate=out]").forEach(function (node) { node.hidden = false; });
    $$("[data-session=in]").forEach(function (node) { node.hidden = true; });
    $$("[data-session=out]").forEach(function (node) { node.hidden = false; });
  }
})();
