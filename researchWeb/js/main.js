(function () {
  "use strict";

  var docEl = document.documentElement;
  var header = document.querySelector(".site-header");
  var nav = document.querySelector(".site-nav");
  var navToggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  var sections = document.querySelectorAll("main section[id]");
  var yearEl = document.getElementById("year");
  var form = document.getElementById("contact-form");
  var formStatus = document.getElementById("form-status");
  var themeToggle = document.getElementById("theme-toggle");
  var scrollBar = document.getElementById("scroll-progress-bar");
  var metaTheme = document.getElementById("meta-theme-color");
  var milestoneSelect = document.getElementById("milestone-select");

  var THEME_KEY = "museum-research-theme";
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function setTheme(theme) {
    if (theme !== "light" && theme !== "dark") theme = "light";
    docEl.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
    if (metaTheme) {
      metaTheme.setAttribute("content", theme === "dark" ? "#0c0b0a" : "#faf9f7");
    }
  }

  function initTheme() {
    var stored = getStoredTheme();
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    } else if (prefersDark.matches) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }

  initTheme();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = docEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
      setTheme(next);
    });
  }

  prefersDark.addEventListener("change", function (e) {
    if (getStoredTheme()) return;
    setTheme(e.matches ? "dark" : "light");
  });

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function closeMobileNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    if (header) header.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  }

  function openMobileNav() {
    if (!nav || !navToggle) return;
    nav.classList.add("is-open");
    if (header) header.classList.add("nav-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    nav.addEventListener("click", function (e) {
      var t = e.target;
      if (t.closest && t.closest('a[href^="#"]')) {
        if (window.matchMedia("(max-width: 1024px)").matches) {
          closeMobileNav();
        }
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMobileNav();
  });

  window.addEventListener("resize", function () {
    if (window.matchMedia("(min-width: 1025px)").matches) {
      closeMobileNav();
    }
  });

  function getScrollOffset() {
    return header ? header.offsetHeight + 10 : 88;
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - getScrollOffset();
      window.scrollTo({ top: top, behavior: "smooth" });
      history.pushState(null, "", id);
    });
  });

  var linkById = {};
  navLinks.forEach(function (link) {
    var href = link.getAttribute("href");
    if (href && href.startsWith("#") && href.length > 1) {
      if (!linkById[href]) linkById[href] = [];
      linkById[href].push(link);
    }
  });

  function setActiveNav() {
    var y = window.scrollY + getScrollOffset() + 24;
    var current = "#home";
    sections.forEach(function (sec) {
      if (sec.offsetTop <= y) {
        current = "#" + sec.id;
      }
    });
    navLinks.forEach(function (l) {
      l.classList.remove("is-active");
    });
    var toActivate = linkById[current];
    if (toActivate) {
      toActivate.forEach(function (l) {
        l.classList.add("is-active");
      });
    }
  }

  function updateScrollUI() {
    var scrollY = window.scrollY;
    if (header) {
      header.classList.toggle("is-scrolled", scrollY > 12);
    }
    if (scrollBar) {
      var doc = document.documentElement;
      var total = doc.scrollHeight - window.innerHeight;
      var p = total > 0 ? (scrollY / total) * 100 : 0;
      scrollBar.style.width = Math.min(100, Math.max(0, p)) + "%";
    }
    setActiveNav();
  }

  var scrollTimer;
  window.addEventListener(
    "scroll",
    function () {
      if (scrollTimer) window.cancelAnimationFrame(scrollTimer);
      scrollTimer = window.requestAnimationFrame(updateScrollUI);
    },
    { passive: true }
  );
  updateScrollUI();

  if (milestoneSelect) {
    milestoneSelect.addEventListener("change", function () {
      var id = milestoneSelect.value;
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      var top = target.getBoundingClientRect().top + window.pageYOffset - getScrollOffset();
      window.scrollTo({ top: top, behavior: "smooth" });
      history.pushState(null, "", "#" + id);
    });
  }

  function runCounters() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".stat-value[data-target]").forEach(function (el) {
        var t = el.getAttribute("data-target");
        var s = el.getAttribute("data-suffix") || "";
        if (t != null) el.textContent = t + s;
      });
      return;
    }

    var statEls = document.querySelectorAll(".stat-value[data-target]");
    if (!statEls.length || !("IntersectionObserver" in window)) {
      statEls.forEach(function (el) {
        var t = el.getAttribute("data-target");
        var s = el.getAttribute("data-suffix") || "";
        if (t != null) el.textContent = t + s;
      });
      return;
    }

    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          obs.unobserve(el);
          var target = parseInt(el.getAttribute("data-target"), 10);
          var suffix = el.getAttribute("data-suffix") || "";
          if (isNaN(target)) return;
          var duration = 1400;
          var start = performance.now();
          function tick(now) {
            var t = Math.min(1, (now - start) / duration);
            var eased = 1 - Math.pow(1 - t, 3);
            var val = Math.round(eased * target);
            el.textContent = val + suffix;
            if (t < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.35, rootMargin: "0px" }
    );

    statEls.forEach(function (el) {
      obs.observe(el);
    });
  }

  runCounters();

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var revealEls = document.querySelectorAll(".reveal");
    if (revealEls.length && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  var techToggle = document.getElementById("tech-panel-toggle");
  var techDrawer = document.getElementById("tech-panel-drawer");
  var techPanel = document.querySelector(".tech-panel");

  if (techToggle && techDrawer && techPanel) {
    techToggle.addEventListener("click", function () {
      var open = !techPanel.classList.contains("is-open");
      techPanel.classList.toggle("is-open", open);
      techToggle.setAttribute("aria-expanded", open ? "true" : "false");
      techDrawer.setAttribute("aria-hidden", open ? "false" : "true");
      if (open) {
        techDrawer.removeAttribute("inert");
      } else {
        techDrawer.setAttribute("inert", "");
      }
    });
  }

  if (form && formStatus) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      formStatus.textContent = "";
      formStatus.classList.remove("success", "error");

      var name = form.querySelector("#name");
      var email = form.querySelector("#email");
      var message = form.querySelector("#message");
      if (!name || !email || !message) return;

      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        formStatus.textContent = "Please fill in all fields.";
        formStatus.classList.add("error");
        return;
      }

      var em = email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
        formStatus.textContent = "Please enter a valid email address.";
        formStatus.classList.add("error");
        return;
      }

      var endpoint = (form.getAttribute("data-mail-endpoint") || "").trim();
      var recipient = (form.getAttribute("data-recipient-email") || "").trim();
      var submitBtn = form.querySelector('button[type="submit"]');
      var originalBtnText = submitBtn ? submitBtn.textContent : "";

      function setSubmitting(isSubmitting) {
        if (!submitBtn) return;
        submitBtn.disabled = isSubmitting;
        submitBtn.setAttribute("aria-busy", isSubmitting ? "true" : "false");
        submitBtn.textContent = isSubmitting ? "Sending..." : originalBtnText;
      }

      if (!endpoint) {
        var subject = encodeURIComponent("MuseumLab Website Inquiry");
        var body = encodeURIComponent(
          "Name: " +
            name.value.trim() +
            "\nEmail: " +
            em +
            "\n\nMessage:\n" +
            message.value.trim()
        );
        var to = recipient || "yourproject@email.com";
        window.location.href = "mailto:" + to + "?subject=" + subject + "&body=" + body;
        formStatus.textContent =
          "Opening your email app. To enable direct web sending, add your endpoint to data-mail-endpoint in index.html.";
        formStatus.classList.add("success");
        return;
      }

      setSubmitting(true);
      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          name: name.value.trim(),
          email: em,
          message: message.value.trim()
        })
      })
        .then(function (res) {
          if (!res.ok) throw new Error("submit_failed");
          formStatus.textContent = "Message sent successfully. We will get back to you soon.";
          formStatus.classList.add("success");
          form.reset();
        })
        .catch(function () {
          formStatus.textContent =
            "Could not send right now. Please try again or email us directly from the contact card.";
          formStatus.classList.add("error");
        })
        .finally(function () {
          setSubmitting(false);
        });
    });
  }
})();
