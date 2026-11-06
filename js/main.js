/* ==========================================================================
   CHOICE Overseas International Co., Limited
   Global behaviour — single script for the entire site.
   Responsibilities: shared header/footer, SEO + JSON-LD, sprite loading,
   reveal animations, navigation, news filter, FAQ, form validation.
   ========================================================================== */
(function () {
  "use strict";

  /* Mark the document as script-capable so the CSS reveal animations engage.
     If anything below fails fatally we remove this class again, which keeps
     all content visible instead of leaving the page blank. */
  var root = document.documentElement;
  root.classList.add("js");
  window.addEventListener("error", function () {
    root.classList.remove("js");
  });

  /* ----------------------------------------------------------------------
     0. SITE CONFIG — single source of truth for shared data
     ---------------------------------------------------------------------- */
  var SITE = {
    company: "CHOICE Overseas International Co., Limited",
    companyShort: "CHOICE Overseas",
    address:
      "ROOM H18 4/F, CENTURY INDUSTRIAL CENTRE, 33-35 AU PUI WAN STREET FOTAN, SHA TIN, HONG KONG",
    addressShort: "Century Industrial Centre, Sha Tin, Hong Kong",
    website: "cishihaiwai.com",
    url: "https://cishihaiwai.com/",
    emailSupport: "support@cishihaiwai.com",
    emailAccount: "baipeng@cishihaiwai.com",
    scope:
      "Cross-border business consultation, international marketing planning, brand advisory, general trading and cross-border e-commerce support.",
    nav: [
      { label: "Home", href: "./", key: "home" },
      { label: "Services", href: "./services.html", key: "services" },
      { label: "Culture", href: "./culture.html", key: "culture" },
      { label: "News", href: "./news.html", key: "news" },
      { label: "Contact", href: "./contact.html", key: "contact" }
    ]
  };

  var SEO = {
    "/": {
      title: "CHOICE Overseas International Co., Limited | Cross-border Business Consultation & Trading",
      description:
        "CHOICE Overseas International Co., Limited delivers cross-border business consultation, international marketing planning, brand advisory, general trading and cross-border e-commerce support from Hong Kong.",
      canonical: "https://cishihaiwai.com/",
      image: "https://cishihaiwai.com/images/hero.jpg"
    },
    "/index.html": {
      title: "CHOICE Overseas International Co., Limited | Cross-border Business Consultation & Trading",
      description:
        "CHOICE Overseas International Co., Limited delivers cross-border business consultation, international marketing planning, brand advisory, general trading and cross-border e-commerce support from Hong Kong.",
      canonical: "https://cishihaiwai.com/",
      image: "https://cishihaiwai.com/images/hero.jpg"
    },
    "/services.html": {
      title: "Services & Mobile Management App | CHOICE Overseas International",
      description:
        "Our core business scope: cross-border business consultation, international marketing planning, brand advisory, general trading and cross-border e-commerce support — all delivered through our mobile management app.",
      canonical: "https://cishihaiwai.com/services.html",
      image: "https://cishihaiwai.com/images/hero.jpg"
    },
    "/culture.html": {
      title: "Our Culture, Mission & Milestones | CHOICE Overseas International",
      description:
        "Mission, vision, values and the milestone timeline of CHOICE Overseas International Co., Limited, a Hong Kong based cross-border business and trading company.",
      canonical: "https://cishihaiwai.com/culture.html",
      image: "https://cishihaiwai.com/images/hero.jpg"
    },
    "/news.html": {
      title: "Newsroom & Market Insights | CHOICE Overseas International",
      description:
        "Company announcements, market insights and cross-border commerce updates from the team at CHOICE Overseas International Co., Limited.",
      canonical: "https://cishihaiwai.com/news.html",
      image: "https://cishihaiwai.com/images/hero.jpg"
    },
    "/contact.html": {
      title: "Contact Us | CHOICE Overseas International Co., Limited",
      description:
        "Contact CHOICE Overseas International Co., Limited — ROOM H18 4/F, CENTURY INDUSTRIAL CENTRE, 33-35 AU PUI WAN STREET FOTAN, SHA TIN, HONG KONG.",
      canonical: "https://cishihaiwai.com/contact.html",
      image: "https://cishihaiwai.com/images/hero.jpg"
    },
    "/privacy.html": {
      title: "Privacy Policy | CHOICE Overseas International Co., Limited",
      description:
        "How CHOICE Overseas International Co., Limited collects, uses, shares and protects personal data across our website and mobile applications.",
      canonical: "https://cishihaiwai.com/privacy.html",
      image: "https://cishihaiwai.com/images/hero.jpg"
    },
    "/terms.html": {
      title: "Terms of Service | CHOICE Overseas International Co., Limited",
      description:
        "Terms governing access to and use of the CHOICE Overseas International website, mobile management app and related services.",
      canonical: "https://cishihaiwai.com/terms.html",
      image: "https://cishihaiwai.com/images/hero.jpg"
    },
    "/404.html": {
      title: "Page Not Found | CHOICE Overseas International Co., Limited",
      description:
        "The page you are looking for has moved or no longer exists. Return to the CHOICE Overseas International homepage.",
      canonical: "https://cishihaiwai.com/404.html",
      image: "https://cishihaiwai.com/images/hero.jpg"
    }
  };

  var DEFAULT_SEO = {
    title: "CHOICE Overseas International Co., Limited",
    description:
      "Cross-border business consultation, international marketing planning, brand advisory, general trading and cross-border e-commerce support.",
    canonical: "https://cishihaiwai.com/",
    image: "https://cishihaiwai.com/images/hero.jpg"
  };

  /* ----------------------------------------------------------------------
     1. SMALL HELPERS
     ---------------------------------------------------------------------- */
  var IS_FILE_PROTOCOL = window.location.protocol === "file:";
  /* Under file:// a "./" link resolves to the folder URI, which the browser
     renders as an OS directory index. Point it at the actual page instead. */
  var HOME_HREF = IS_FILE_PROTOCOL ? "./index.html" : "./";

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }
  function el(tag, cls, html) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }
  function svgUse(id, cls) {
    return (
      '<svg class="' +
      (cls || "") +
      '" aria-hidden="true" focusable="false"><use href="#' +
      id +
      '"></use></svg>'
    );
  }
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[c];
    });
  }

  /* ----------------------------------------------------------------------
     2. SPRITE  [复用-E]
     Fetch images/sprite.svg once, inject it into the document, then swap
     every [data-icon] / [data-mascot] placeholder for a <use> reference.
     Degrades gracefully when the sprite cannot be fetched.
     ---------------------------------------------------------------------- */
  var spriteReady = false;

  function loadSprite() {
    return fetch("images/sprite.svg", { cache: "force-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("sprite http " + res.status);
        return res.text();
      })
      .then(function (text) {
        var host = document.createElement("div");
        host.id = "sprite-host";
        host.setAttribute("aria-hidden", "true");
        host.style.cssText =
          "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden";
        host.innerHTML = text;
        document.body.insertBefore(host, document.body.firstChild);
        spriteReady = true;
        document.documentElement.classList.add("sprite-ready");
        applyIcons();
        return true;
      })
      .catch(function () {
        /* file:// pages cannot fetch the sprite (CORS) — fall back to CSS */
        document.documentElement.classList.add("sprite-missing");
        applyIconFallbacks();
        return false;
      });
  }

  /* Replace <span data-icon="x"> with the matching sprite reference. */
  function applyIcons() {
    $$("[data-icon]").forEach(function (node) {
      if (node.dataset.iconApplied === "1") return;
      var id = node.getAttribute("data-icon");
      node.innerHTML = svgUse(id, node.getAttribute("data-icon-class") || "");
      node.dataset.iconApplied = "1";
    });
  }

  /* Sprite unavailable: keep layout, show a typographic monogram instead.
     This must overwrite icons that applyIcons() already replaced with <use>,
     otherwise the placeholder stays an empty box. */
  function applyIconFallbacks() {
    $$("[data-icon]").forEach(function (node) {
      var id = node.getAttribute("data-icon");
      node.textContent = id === "logo" ? "C" : "";
      node.dataset.iconApplied = "1";
    });
  }

  /* Replace <span data-mascot="cat"> with the mascot sprite reference. */
  function applyMascots() {
    $$("[data-mascot]").forEach(function (node) {
      if (node.dataset.mascotApplied === "1") return;
      var id = node.getAttribute("data-mascot");
      node.innerHTML = svgUse(id, "mascot__svg");
      node.dataset.mascotApplied = "1";
    });
  }

  /* ----------------------------------------------------------------------
     3. SHARED HEADER  [复用-C]
     ---------------------------------------------------------------------- */
  function currentPath() {
    var p = window.location.pathname || "/";
    if (IS_FILE_PROTOCOL) {
      /* file:// gives /E:/path/to/page.html — keep only the file name */
      var seg = p.split("/").pop();
      p = "/" + (seg || "index.html");
    }
    if (p === "" || p === "/index.html" || p === "/index.htm") return "/";
    return p;
  }

  function activeKey() {
    var p = currentPath();
    if (p === "/" || p === "/index.html") return "home";
    for (var i = 0; i < SITE.nav.length; i++) {
      var href = SITE.nav[i].href;
      var seg = href === "./" ? "/" : "/" + href.replace(/^\.\//, "");
      if (seg === p) return SITE.nav[i].key;
    }
    if (p.indexOf("/services") === 0) return "services";
    if (p.indexOf("/culture") === 0) return "culture";
    if (p.indexOf("/news") === 0) return "news";
    if (p.indexOf("/contact") === 0) return "contact";
    return "";
  }

  function injectHeader() {
    var host = $("#site-header");
    if (!host) return;

    var active = activeKey();
    var links = SITE.nav.map(function (item) {
      var cls = "nav__link" + (item.key === active ? " is-active" : "");
      var aria = item.key === active ? ' aria-current="page"' : "";
      return '<a class="' + cls + '" href="' + item.href + '"' + aria + ">" + item.label + "</a>";
    });

    host.className = "site-header";
    host.innerHTML =
      '<div class="site-header__inner">' +
      '<a class="brand" href="./">' +
      '<span class="brand__mark" data-icon="logo"></span>' +
      '<span class="brand__text">' +
      '<span class="brand__name">' + escapeHtml(SITE.companyShort) + "</span>" +
      '<span class="brand__sub">Global Trade &amp; Consulting</span>' +
      "</span></a>" +
      '<nav class="nav" id="primary-nav" aria-label="Primary">' +
      links.join("") +
      '<a class="btn btn--primary btn--sm nav__cta" href="./contact.html">Talk to Us</a>' +
      "</nav>" +
      '<button class="nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" aria-label="Toggle navigation">' +
      '<span class="icon-menu" data-icon="menu"></span>' +
      '<span class="icon-close" data-icon="close"></span>' +
      "</button>" +
      "</div>";

    applyIcons();
  }

  /* ----------------------------------------------------------------------
     4. SHARED FOOTER  [复用-D]
     ---------------------------------------------------------------------- */
  function injectFooter() {
    var host = $("#site-footer");
    if (!host) return;

    var year = new Date().getFullYear();

    host.className = "site-footer";
    host.innerHTML =
      '<div class="container">' +
      '<div class="site-footer__grid">' +
      '<div class="footer-brand">' +
      '<a class="brand" href="./">' +
      '<span class="brand__mark" data-icon="logo"></span>' +
      '<span class="brand__text">' +
      '<span class="brand__name">' + escapeHtml(SITE.companyShort) + "</span>" +
      '<span class="brand__sub">Global Trade &amp; Consulting</span>' +
      "</span></a>" +
      '<p class="footer-brand__desc">' + escapeHtml(SITE.scope) + "</p>" +
      "</div>" +
      '<div>' +
      "<h4>Explore</h4>" +
      '<ul class="footer-links">' +
      '<li><a href="./">Home</a></li>' +
      '<li><a href="./services.html">Services</a></li>' +
      '<li><a href="./culture.html">Culture</a></li>' +
      '<li><a href="./news.html">News</a></li>' +
      '<li><a href="./contact.html">Contact</a></li>' +
      "</ul>" +
      "</div>" +
      '<div>' +
      "<h4>Mobile App</h4>" +
      '<ul class="footer-links">' +
      '<li><a href="./services.html#app">Download for iOS</a></li>' +
      '<li><a href="./services.html#app">Download for Android</a></li>' +
      '<li><a href="./services.html#app">Feature overview</a></li>' +
      '<li><a href="./services.html#app">Release notes</a></li>' +
      "</ul>" +
      "</div>" +
      '<div>' +
      "<h4>Company</h4>" +
      '<ul class="footer-contact">' +
      '<li>' + svgUse("briefcase") + "<span>" + escapeHtml(SITE.company) + "</span></li>" +
      '<li>' + svgUse("map-pin") + "<span>" + escapeHtml(SITE.address) + "</span></li>" +
      '<li>' + svgUse("globe") + '<span><a href="https://' + SITE.website + '/">' + SITE.website + "</a></span></li>" +
      '<li>' + svgUse("mail") + '<span><a href="mailto:' + SITE.emailSupport + '">' + SITE.emailSupport + "</a></span></li>" +
      "</ul>" +
      "</div>" +
      "</div>" +
      '<div class="site-footer__bottom">' +
      '<ul class="legal-links">' +
      '<li><a href="./privacy.html">Privacy Policy</a></li>' +
      '<li><a href="./terms.html">Terms of Service</a></li>' +
      "</ul>" +
      '<p>© ' + year + " " + escapeHtml(SITE.company) + ". All rights reserved.</p>" +
      "</div>" +
      "</div>";

    applyIcons();
  }

  /* ----------------------------------------------------------------------
     5. SEO + JSON-LD  [复用-F]
     ---------------------------------------------------------------------- */
  function upsertMeta(attr, key, content) {
    if (!content) return;
    var node = document.head.querySelector('meta[' + attr + '="' + key + '"]');
    if (!node) {
      node = document.createElement("meta");
      node.setAttribute(attr, key);
      document.head.appendChild(node);
    }
    node.setAttribute("content", content);
  }

  function upsertLink(rel, href) {
    var node = document.head.querySelector('link[rel="' + rel + '"]');
    if (!node) {
      node = document.createElement("link");
      node.setAttribute("rel", rel);
      document.head.appendChild(node);
    }
    node.setAttribute("href", href);
  }

  function applySEO() {
    var path = currentPath();
    var cfg = SEO[path] || SEO[path.replace(/\/$/, "/index.html")] || DEFAULT_SEO;

    document.title = cfg.title;
    upsertMeta("name", "description", cfg.description);
    upsertLink("canonical", cfg.canonical);

    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", SITE.company);
    upsertMeta("property", "og:locale", "en_US");
    upsertMeta("property", "og:title", cfg.title);
    upsertMeta("property", "og:description", cfg.description);
    upsertMeta("property", "og:url", cfg.canonical);
    upsertMeta("property", "og:image", cfg.image);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", cfg.title);
    upsertMeta("name", "twitter:description", cfg.description);
    upsertMeta("name", "twitter:image", cfg.image);

    injectJsonLd();
  }

  function injectJsonLd() {
    var data = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE.company,
      alternateName: SITE.companyShort,
      url: SITE.url,
      email: SITE.emailSupport,
      description: SITE.scope,
      address: {
        "@type": "PostalAddress",
        streetAddress:
          "ROOM H18 4/F, CENTURY INDUSTRIAL CENTRE, 33-35 AU PUI WAN STREET FOTAN",
        addressLocality: "Sha Tin",
        addressRegion: "Hong Kong",
        addressCountry: "HK"
      },
      sameAs: ["https://" + SITE.website + "/"]
    };

    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  /* ----------------------------------------------------------------------
     6. REVEAL ANIMATIONS  [复用-G]
     ---------------------------------------------------------------------- */
  function initReveal() {
    var nodes = $$(".reveal, .stagger");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) {
        n.classList.add("in");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      {
        /* threshold 0 so tall groups (e.g. a 3-column news grid) reveal as
           soon as they peek into the viewport instead of waiting for a
           percentage of their (large) area. */
        threshold: 0,
        rootMargin: "0px 0px -6% 0px"
      }
    );

    nodes.forEach(function (n) {
      io.observe(n);
    });
  }

  /* ----------------------------------------------------------------------
     7. NAVIGATION BEHAVIOUR
     ---------------------------------------------------------------------- */
  function initNav() {
    var toggle = $("#nav-toggle");
    var nav = $("#primary-nav");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.style.overflow = open ? "hidden" : "";
      });

      nav.addEventListener("click", function (e) {
        if (e.target.closest("a")) {
          nav.classList.remove("is-open");
          toggle.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        }
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && nav.classList.contains("is-open")) {
          nav.classList.remove("is-open");
          toggle.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        }
      });
    }

    var header = $("#site-header");
    var onScroll = function () {
      if (!header) return;
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Smooth in-page anchors, offset for the fixed header. */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = 76;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: "smooth" });
      history.replaceState(null, "", id);
    });
  }

  /* ----------------------------------------------------------------------
     8. BACK TO TOP
     ---------------------------------------------------------------------- */
  function initToTop() {
    var btn = el("button", "to-top", svgUse("arrow-up"));
    btn.type = "button";
    btn.setAttribute("aria-label", "Back to top");
    document.body.appendChild(btn);
    applyIcons();

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    var toggle = function () {
      btn.classList.toggle("is-visible", window.scrollY > 600);
    };
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });
  }

  /* ----------------------------------------------------------------------
     9. NEWS FILTER
     ---------------------------------------------------------------------- */
  function initNewsFilter() {
    var buttons = $$("[data-filter]");
    var cards = $$("[data-category]");
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var value = btn.getAttribute("data-filter");
        buttons.forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        cards.forEach(function (card) {
          var cat = card.getAttribute("data-category");
          var show = value === "all" || cat === value;
          card.classList.toggle("is-hidden", !show);
          if (show) {
            card.classList.remove("in");
            requestAnimationFrame(function () {
              card.classList.add("in");
            });
          }
        });
      });
    });
  }

  /* ----------------------------------------------------------------------
     10. FAQ ACCORDION
     ---------------------------------------------------------------------- */
  function initFaq() {
    $$(".faq__q").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq__item");
        var panel = item.querySelector(".faq__a");
        var open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        if (panel) {
          panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
        }
      });
    });
  }

  /* ----------------------------------------------------------------------
     11. CONTACT FORM VALIDATION
     ---------------------------------------------------------------------- */
  function initForm() {
    var form = $("#contact-form");
    if (!form) return;

    var status = $("#form-status");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    var validate = function (input) {
      var field = input.closest(".field");
      if (!field) return true;
      var ok = true;
      var value = (input.value || "").trim();

      if (input.hasAttribute("required") && !value) ok = false;
      if (ok && input.type === "email" && value && !emailRe.test(value)) ok = false;
      if (ok && input.type === "checkbox" && !input.checked) ok = false;

      field.classList.toggle("has-error", !ok);
      return ok;
    };

    $$("input, textarea, select", form).forEach(function (input) {
      input.addEventListener("blur", function () {
        validate(input);
      });
      input.addEventListener("input", function () {
        var field = input.closest(".field");
        if (field && field.classList.contains("has-error")) validate(input);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var inputs = $$("input, textarea, select", form);
      var firstBad = null;
      inputs.forEach(function (input) {
        if (!validate(input) && !firstBad) firstBad = input;
      });

      if (firstBad) {
        if (status) {
          status.textContent =
            "Please complete the highlighted fields before sending your message.";
          status.className = "form__status is-visible is-err";
        }
        firstBad.focus();
        return;
      }

      if (status) {
        status.textContent =
          "Thank you — your message has been received. Our team replies to business enquiries within one business day.";
        status.className = "form__status is-visible is-ok";
      }
      form.reset();
    });
  }

  /* ----------------------------------------------------------------------
     12. BOOT
     ---------------------------------------------------------------------- */
  function boot() {
    injectHeader();
    injectFooter();
    applySEO();
    initNav();
    initSmoothScroll();
    initReveal();
    initToTop();
    initNewsFilter();
    initFaq();
    initForm();
    loadSprite().then(function (ok) {
      if (ok) applyMascots();
    });
  }

  function safeBoot() {
    try {
      boot();
      /* Local preview: make the home link open the actual page instead of the
         OS folder index, and keep it relative for every other link. */
      if (IS_FILE_PROTOCOL) {
        var homeLinks = document.querySelectorAll('a[href="./"]');
        for (var i = 0; i < homeLinks.length; i++) {
          homeLinks[i].setAttribute("href", HOME_HREF);
        }
      }
    } catch (err) {
      /* A fatal error during boot must never leave the page blank. */
      root.classList.remove("js");
      if (window.console && console.error) console.error("Boot failed:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", safeBoot);
  } else {
    safeBoot();
  }
})();
