/* ============================================================
   FLAGSHIP TECHS — interaction layer

   Plain JavaScript, no libraries, no build step.

   Everything here is an ENHANCEMENT. All page content is real
   HTML, so if this file fails to load the site still reads and
   navigates — it just stops animating. That is deliberate: a
   static page should never depend on script to show its words.
   ============================================================ */

(function () {
  'use strict';

  // Script reached the browser, so the CSS no-js fallbacks can go.
  document.documentElement.classList.remove('no-js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================
     1 · SCROLL REVEALS
     Adds `is-in` once an element scrolls into view, then stops
     watching it. IntersectionObserver only — no scroll handler,
     no layout reads.
     ========================================================== */

  var reveals = document.querySelectorAll('[data-reveal]');

  if (reduced || !('IntersectionObserver' in window)) {
    // Show everything immediately rather than animating.
    Array.prototype.forEach.call(reveals, function (el) {
      el.classList.add('is-in');
    });
  } else {
    var revealIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          revealIO.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );
    Array.prototype.forEach.call(reveals, function (el) {
      revealIO.observe(el);
    });
  }

  /* Hero entrance — one frame after load so the transition runs. */
  window.setTimeout(function () {
    document.body.classList.add('loaded');
  }, 60);

  /* ==========================================================
     2 · NAV
     Transparent over the dark hero, then inverts to a bone bar
     with a hairline once the hero is behind you. State comes
     from a sentinel element, never from a scroll listener.
     ========================================================== */

  var navEl = document.getElementById('nav');
  var sentinel = document.getElementById('nav-sentinel');

  if (navEl && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      function (entries) {
        navEl.classList.toggle('is-solid', entries[0].boundingClientRect.top < 0);
      },
      { threshold: 0 }
    ).observe(sentinel);
  }

  /* ==========================================================
     3 · MOBILE MENU
     Full-screen overlay. Escape closes, focus is trapped while
     open and returns to the trigger, background scroll locked.
     ========================================================== */

  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobile-menu');

  if (burger && menu) {
    var menuOpen = false;

    var openMenu = function () {
      menuOpen = true;
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close navigation');
      document.body.classList.add('menu-open', 'no-scroll');
      window.setTimeout(function () {
        var first = menu.querySelector('a[href]');
        if (first) first.focus();
      }, 260);
    };

    var closeMenu = function () {
      menuOpen = false;
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open navigation');
      document.body.classList.remove('menu-open', 'no-scroll');
      burger.focus();
    };

    burger.addEventListener('click', function () {
      if (menuOpen) closeMenu();
      else openMenu();
    });

    // Following a link should close the overlay behind you.
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a[href]')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (!menuOpen) return;

      if (e.key === 'Escape') {
        closeMenu();
        return;
      }
      if (e.key !== 'Tab') return;

      // Keep focus inside the overlay while it is open.
      var items = menu.querySelectorAll('a[href], button:not([disabled])');
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ==========================================================
     4 · THE SPEC RAIL
     Progress is written straight to a CSS custom property
     inside rAF — one write per frame, no layout reads while
     scrolling. The chapter index comes from an observer.
     ========================================================== */

  var railIndex = document.getElementById('rail-index');
  var railLabel = document.getElementById('rail-label');
  var rail = document.getElementById('rail');

  /* Chapter index shown on the rail. Order matches the page. */
  var chapters = {
    hero: ['00', 'Titan'],
    categories: ['01', 'Shop'],
    systems: ['02', 'Systems'],
    'use-cases': ['03', 'Purpose'],
    laptops: ['04', 'Laptops'],
    gear: ['05', 'Gear'],
    displays: ['06', 'Displays'],
    builds: ['07', 'Custom'],
    services: ['08', 'Service'],
    showcase: ['09', 'Built'],
    contact: ['10', 'Visit']
  };

  (function railProgress() {
    var frame = 0;
    var max = 1;

    var measure = function () {
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };

    var write = function () {
      frame = 0;
      var p = Math.min(1, Math.max(0, window.scrollY / max));
      document.documentElement.style.setProperty('--rail-progress', String(p));
    };

    var onScroll = function () {
      if (!frame) frame = window.requestAnimationFrame(write);
    };

    measure();
    write();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('load', measure);
  })();

  if (rail && railIndex && railLabel && 'IntersectionObserver' in window) {
    var railObserver = new IntersectionObserver(
      function (entries) {
        // The section covering the upper third of the viewport wins.
        var hit = entries
          .filter(function (e) { return e.isIntersecting; })
          .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; })[0];
        if (!hit) return;

        var match = chapters[hit.target.dataset.chapter];
        if (match) {
          railIndex.textContent = match[0];
          railLabel.textContent = match[1];
        }
        rail.classList.toggle('on-light', hit.target.dataset.ground === 'light');
      },
      { rootMargin: '-18% 0px -62% 0px', threshold: [0, 0.25, 0.5] }
    );
    Array.prototype.forEach.call(document.querySelectorAll('[data-chapter]'), function (s) {
      railObserver.observe(s);
    });
  }

  /* ==========================================================
     5 · LAPTOP FILTER
     Segment is the only axis; anything more would be clutter.
     ========================================================== */

  var filters = document.querySelectorAll('.filter[data-segment]');
  var laptopGrid = document.getElementById('laptop-grid');

  if (filters.length && laptopGrid) {
    var items = laptopGrid.querySelectorAll('li[data-segment]');

    Array.prototype.forEach.call(filters, function (button) {
      button.addEventListener('click', function () {
        var want = button.dataset.segment;

        Array.prototype.forEach.call(filters, function (b) {
          b.setAttribute('aria-pressed', String(b === button));
        });

        Array.prototype.forEach.call(items, function (li) {
          var show = want === 'All' || li.dataset.segment === want;
          li.classList.toggle('is-filtered', !show);
        });
      });
    });
  }

  /* ==========================================================
     6 · QUICK VIEW
     A spec sheet that slides out of the right edge. The card
     stays minimal; the full configuration lives here. Specs
     travel on the button's data- attributes, so the content is
     still in the HTML rather than hidden in this file.
     ========================================================== */

  var qv = document.getElementById('quickview');

  if (qv) {
    var qvPanel = document.getElementById('qv-panel');
    var qvName = document.getElementById('qv-name');
    var qvSku = document.getElementById('qv-sku');
    var qvTier = document.getElementById('qv-tier');
    var qvPrice = document.getElementById('qv-price');
    var qvImg = document.getElementById('qv-img');
    var qvSpecs = document.getElementById('qv-specs');
    var qvOpen = false;
    var returnTo = null;

    var ROWS = [
      ['Processor', 'cpu'],
      ['Graphics', 'gpu'],
      ['Memory', 'ram'],
      ['Storage', 'storage'],
      ['Cooling', 'cooling'],
      ['Power', 'psu'],
      ['Chassis', 'chassis']
    ];

    var fill = function (d) {
      qvName.textContent = d.name;
      qvSku.textContent = d.sku;
      qvTier.textContent = d.tier;
      qvPrice.textContent = d.price;
      qvImg.src = d.img;
      qvImg.alt = d.alt;

      qvSpecs.textContent = '';
      ROWS.forEach(function (row) {
        var wrap = document.createElement('div');
        wrap.className = 'spec-row';

        var dt = document.createElement('dt');
        dt.className = 't-label';
        dt.textContent = row[0];

        var dd = document.createElement('dd');
        dd.className = 't-spec';
        dd.textContent = d[row[1]];

        wrap.appendChild(dt);
        wrap.appendChild(dd);
        qvSpecs.appendChild(wrap);
      });

      // Warranty is the same on every system, so it is stated here.
      var extra = document.createElement('div');
      extra.className = 'spec-row';
      extra.innerHTML =
        '<dt class="t-label">Warranty</dt><dd class="t-spec">3 years parts &amp; labour</dd>';
      qvSpecs.appendChild(extra);
    };

    var openQV = function (data, trigger) {
      returnTo = trigger || null;
      fill(data);
      qvOpen = true;
      qv.classList.add('is-open');
      qv.setAttribute('aria-hidden', 'false');

      // Lock scroll, compensating for the scrollbar so nothing shifts.
      var bar = window.innerWidth - document.documentElement.clientWidth;
      document.body.classList.add('no-scroll');
      if (bar > 0) document.body.style.paddingRight = bar + 'px';

      window.setTimeout(function () {
        var close = document.getElementById('qv-close');
        if (close) close.focus();
      }, 220);
    };

    var closeQV = function () {
      if (!qvOpen) return;
      qvOpen = false;
      qv.classList.remove('is-open');
      qv.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      document.body.style.paddingRight = '';
      if (returnTo && returnTo.focus) returnTo.focus();
    };

    /* Every card carries its own specs; the hero Configure button
       borrows the matching card's data instead of duplicating it. */
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-quick]');
      if (!trigger) return;

      var source = trigger;
      if (!trigger.dataset.name) {
        source = document.querySelector('.sys-card[data-quick="' + trigger.dataset.quick + '"]');
      }
      if (!source) return;

      e.preventDefault();
      openQV(source.dataset, trigger);
    });

    var scrim = document.getElementById('qv-scrim');
    var closeBtn = document.getElementById('qv-close');
    if (scrim) scrim.addEventListener('click', closeQV);
    if (closeBtn) closeBtn.addEventListener('click', closeQV);

    document.addEventListener('keydown', function (e) {
      if (!qvOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeQV();
        return;
      }
      if (e.key !== 'Tab') return;

      var focusable = qvPanel.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ==========================================================
     7 · FOOTER YEAR
     ========================================================== */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
