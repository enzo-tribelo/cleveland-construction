(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("#site-nav");

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
  }

  var dialog = document.querySelector("#lightbox");
  var viewer = document.querySelector("#lightbox-img");
  var caption = document.querySelector("#lightbox-cap");
  if (!dialog || !viewer || !caption) return;

  var closeButton = dialog.querySelector(".lightbox-close");
  if (closeButton) {
    closeButton.addEventListener("click", function () {
      dialog.close();
    });
  }

  document.querySelectorAll(".shot").forEach(function (button) {
    button.addEventListener("click", function () {
      var source = button.querySelector("img");
      if (!source) return;
      viewer.src = source.getAttribute("src");
      viewer.alt = source.alt;
      caption.textContent = source.alt;
      dialog.showModal();
    });
  });

  dialog.addEventListener("click", function (event) {
    var rect = dialog.getBoundingClientRect();
    var inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) dialog.close();
  });

  dialog.addEventListener("close", function () {
    viewer.removeAttribute("src");
    viewer.alt = "";
    caption.textContent = "";
  });
})();
