(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("#site-nav");
  var year = document.querySelector("#copyright-year");

  if (year) year.textContent = String(new Date().getFullYear());

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
