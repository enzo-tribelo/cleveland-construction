(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("#site-nav");
  var year = document.querySelector("#copyright-year");

  if (year) year.textContent = String(new Date().getFullYear());

  initAnalytics();
  initSocialLinks();
  initReveal();
  initHeader();

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

function initHeader() {
  var header = document.querySelector(".site-header");
  if (!header) return;
  var tick = function () {
    header.classList.toggle("is-solid", window.scrollY > 28);
  };
  tick();
  window.addEventListener("scroll", tick, { passive: true });
}

function initReveal() {
  var nodes = document.querySelectorAll(".reveal");
  if (!nodes.length) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0, rootMargin: "0px" });

  Array.prototype.forEach.call(nodes, function (node) {
    if (node.id === "projects" || node.classList.contains("project")) return;
    var rect = node.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) return;
    node.classList.add("reveal-pending");
    observer.observe(node);
  });
}

function initSocialLinks() {
  var links = socialEntries();
  if (!links.length) return;
  placeSocialRow(document.querySelector(".contact-links"), links);
  var footer = document.querySelector(".site-footer .wrap");
  var copy = footer && footer.querySelector(".footer-copy");
  if (!footer) return;
  var row = buildSocialNav(links);
  if (copy) footer.insertBefore(row, copy);
  else footer.appendChild(row);
}

function socialEntries() {
  if (typeof SOCIAL_LINKS !== "object" || !SOCIAL_LINKS) return [];
  var networks = [
    { key: "instagram", name: "Instagram" },
    { key: "facebook", name: "Facebook" },
    { key: "linkedin", name: "LinkedIn" },
    { key: "houzz", name: "Houzz" },
    { key: "x", name: "X" }
  ];
  var entries = [];
  networks.forEach(function (network) {
    var href = socialHref(SOCIAL_LINKS[network.key]);
    if (href) entries.push({ name: network.name, href: href, key: network.key });
  });
  return entries;
}

function socialHref(value) {
  if (typeof value !== "string") return "";
  var href = value.trim();
  if (!/^https?:\/\//i.test(href)) return "";
  return href;
}

function placeSocialRow(contactList, links) {
  if (!contactList || !contactList.parentNode) return;
  contactList.parentNode.insertBefore(buildSocialNav(links), contactList.nextSibling);
}

function buildSocialNav(links) {
  var nav = document.createElement("nav");
  nav.className = "social-links";
  nav.setAttribute("aria-label", "Social media");
  var list = document.createElement("ul");
  links.forEach(function (entry) {
    var item = document.createElement("li");
    var link = document.createElement("a");
    link.href = entry.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "Cleveland Construction on " + entry.name);
    link.appendChild(socialIcon(entry.key));
    item.appendChild(link);
    list.appendChild(item);
  });
  nav.appendChild(list);
  return nav;
}

function socialIcon(key) {
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "currentColor");
  path.setAttribute("d", socialIconPath(key));
  svg.appendChild(path);
  return svg;
}

function socialIconPath(key) {
  var paths = {
    instagram: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 4.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm5.25-1.15a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1zM12 9.2A2.8 2.8 0 1 1 9.2 12 2.8 2.8 0 0 1 12 9.2z",
    facebook: "M14.5 8.5H17V5h-2.5C12 5 10 7 10 9.5V11H8v3h2v7h3v-7h2.4l.6-3H13V9.6c0-.7.4-1.1 1.5-1.1z",
    linkedin: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8.1 10.2H5.7V18h2.4zm.15-2.35a1.4 1.4 0 1 0-1.4-1.4 1.4 1.4 0 0 0 1.4 1.4zM18.3 18v-4.3c0-2.3-1.23-3.37-2.87-3.37a2.47 2.47 0 0 0-2.23 1.22h-.06V10.2H10.8c.04.7 0 7.8 0 7.8h2.4v-4.36c0-.23.02-.46.08-.63a1.77 1.77 0 0 1 1.66-1.18c1.17 0 1.64.89 1.64 2.2V18z",
    houzz: "M12 3 3 10.2V21h6.2v-6.2h5.6V21H21V10.2z",
    x: "M4.2 4h3.4l4.1 5.5L16.2 4H20l-6.3 7.2L20.3 20h-3.4l-4.5-6-4.6 6H4l6.7-7.6z"
  };
  return paths[key] || "";
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
