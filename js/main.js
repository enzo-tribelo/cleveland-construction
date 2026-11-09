(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("#site-nav");
  var year = document.querySelector("#copyright-year");

  if (year) year.textContent = String(new Date().getFullYear());

  initAnalytics();

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open") && !(dialog && dialog.open)) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  var dialog = document.querySelector("#lightbox");
  var viewer = document.querySelector("#lightbox-img");
  var caption = document.querySelector("#lightbox-cap");
  var counter = document.querySelector("#lightbox-count");
  var closeButton = dialog && dialog.querySelector(".lightbox-close");
  var prevButton = dialog && dialog.querySelector(".lightbox-prev");
  var nextButton = dialog && dialog.querySelector(".lightbox-next");
  var shots = Array.prototype.slice.call(document.querySelectorAll(".shot"));

  if (!dialog || !viewer || !caption || !shots.length) return;

  var index = 0;
  var opener = null;
  var touchStartX = 0;
  var touchStartY = 0;
  var tracking = false;
  var background = document.querySelectorAll("header, main, footer");

  function setBackgroundHidden(hidden) {
    Array.prototype.forEach.call(background, function (element) {
      if (hidden) {
        element.setAttribute("inert", "");
        element.setAttribute("aria-hidden", "true");
      } else {
        element.removeAttribute("inert");
        element.removeAttribute("aria-hidden");
      }
    });
    document.documentElement.classList.toggle("lightbox-open", hidden);
    var banner = document.querySelector(".cookie-banner");
    if (banner) {
      if (hidden) {
        banner.setAttribute("inert", "");
      } else {
        banner.removeAttribute("inert");
      }
    }
  }

  function focusable() {
    return Array.prototype.filter.call(dialog.querySelectorAll("button"), function (button) {
      return !button.disabled && !button.hidden;
    });
  }

  function show(nextIndex) {
    var total = shots.length;
    index = (nextIndex + total) % total;
    var source = shots[index].querySelector("img");
    if (!source) return;
    viewer.src = source.getAttribute("src");
    viewer.alt = source.alt;
    viewer.width = source.width || source.getAttribute("width") || 1600;
    viewer.height = source.height || source.getAttribute("height") || 1200;
    caption.textContent = source.alt;
    if (counter) counter.textContent = index + 1 + " of " + total;
    var single = total < 2;
    if (prevButton) prevButton.hidden = single;
    if (nextButton) nextButton.hidden = single;
  }

  function step(delta) {
    show(index + delta);
  }

  function openAt(nextIndex, trigger) {
    opener = trigger || document.activeElement;
    show(nextIndex);
    if (nav && toggle && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
    if (!dialog.open) dialog.showModal();
    setBackgroundHidden(true);
    if (closeButton) closeButton.focus();
  }

  shots.forEach(function (button, shotIndex) {
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-controls", "lightbox");
    button.addEventListener("click", function () {
      openAt(shotIndex, button);
    });
  });

  if (closeButton) {
    closeButton.addEventListener("click", function () {
      dialog.close();
    });
  }
  if (prevButton) {
    prevButton.addEventListener("click", function () {
      step(-1);
    });
  }
  if (nextButton) {
    nextButton.addEventListener("click", function () {
      step(1);
    });
  }

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", function () {
    setBackgroundHidden(false);
    viewer.removeAttribute("src");
    viewer.alt = "";
    caption.textContent = "";
    if (counter) counter.textContent = "";
    if (opener && typeof opener.focus === "function") opener.focus();
    opener = null;
  });

  dialog.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "Tab") {
      var items = focusable();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  dialog.addEventListener(
    "touchstart",
    function (event) {
      if (event.touches.length !== 1 || event.target.closest("button")) {
        tracking = false;
        return;
      }
      tracking = true;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    },
    { passive: true }
  );

  dialog.addEventListener(
    "touchend",
    function (event) {
      if (!tracking || !event.changedTouches.length) return;
      tracking = false;
      var touch = event.changedTouches[0];
      var dx = touch.clientX - touchStartX;
      var dy = touch.clientY - touchStartY;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      step(dx < 0 ? 1 : -1);
    },
    { passive: true }
  );
})();

function measurementId() {
  if (typeof GA_MEASUREMENT_ID !== "string") return "";
  return GA_MEASUREMENT_ID.trim();
}

function initAnalytics() {
  var id = measurementId();
  if (!id) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "denied",
    personalization_storage: "denied",
    security_storage: "granted",
    wait_for_update: 500
  });

  var stored = readConsent();
  if (stored === "accepted") {
    loadAnalytics(id);
    return;
  }
  if (stored === "rejected") return;
  showConsentBanner(id);
}

function readConsent() {
  try {
    return localStorage.getItem("cleveland-analytics-consent");
  } catch (error) {
    return null;
  }
}

function writeConsent(value) {
  try {
    localStorage.setItem("cleveland-analytics-consent", value);
  } catch (error) {
    // Storage can be blocked; the choice still applies for this visit.
  }
}

function loadAnalytics(id) {
  if (window.__gaLoaded) return;
  window.__gaLoaded = true;
  window.gtag("consent", "update", {
    analytics_storage: "granted"
  });
  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
  document.head.appendChild(script);
  window.gtag("js", new Date());
  window.gtag("config", id);
}

function showConsentBanner(id) {
  var banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.setAttribute("role", "region");
  banner.setAttribute("aria-label", "Cookie consent");

  var text = document.createElement("p");
  text.textContent = "We use optional Google Analytics to understand how the site is used. It stays off unless you accept. Rejecting is just as easy, and the site works either way.";

  var actions = document.createElement("div");
  actions.className = "cookie-banner-actions";

  var reject = document.createElement("button");
  reject.type = "button";
  reject.className = "cookie-banner-reject";
  reject.textContent = "Reject";

  var accept = document.createElement("button");
  accept.type = "button";
  accept.className = "cookie-banner-accept";
  accept.textContent = "Accept";

  reject.addEventListener("click", function () {
    writeConsent("rejected");
    banner.remove();
  });
  accept.addEventListener("click", function () {
    writeConsent("accepted");
    banner.remove();
    loadAnalytics(id);
  });

  actions.appendChild(reject);
  actions.appendChild(accept);
  banner.appendChild(text);
  banner.appendChild(actions);
  document.body.appendChild(banner);
}
