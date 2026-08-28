/* ============================================================
   C.H. WOLF — site behaviour
   language (auto-detect by locale + memory), header, nav, reveal
   ============================================================ */
(function () {
  'use strict';

  var SUPPORTED = ['zh', 'en', 'de'];
  var STORE_KEY = 'chw_lang';

  /* ---------- language ---------- */
  function detectLang() {
    // 1. explicit prior choice wins
    try {
      var saved = localStorage.getItem(STORE_KEY);
      if (saved && SUPPORTED.indexOf(saved) > -1) return saved;
    } catch (e) {}

    // 2. auto-detect from browser locale (proxy for user region/language)
    var list = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || 'en'];

    for (var i = 0; i < list.length; i++) {
      var code = String(list[i]).toLowerCase();
      if (code.indexOf('zh') === 0) return 'zh';   // 中国大陆/港澳台等
      if (code.indexOf('de') === 0) return 'de';   // DE/AT/CH-de
      if (code.indexOf('en') === 0) return 'en';
    }
    // 3. sensible default for the brand's audiences
    return 'en';
  }

  function applyLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = 'zh';
    document.documentElement.setAttribute('lang', lang);
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
    // update switch UI
    document.querySelectorAll('.lang-switch button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-set-lang') === lang);
    });
    // update <title> / meta if translated versions supplied
    var t = document.querySelector('title[data-title-' + lang + ']');
    if (t) document.title = t.getAttribute('data-title-' + lang);
  }

  function initLang() {
    applyLang(detectLang());
    document.querySelectorAll('.lang-switch button').forEach(function (b) {
      b.addEventListener('click', function () {
        applyLang(b.getAttribute('data-set-lang'));
      });
    });
  }

  /* ---------- sticky header ---------- */
  function initHeader() {
    var head = document.querySelector('.site-head');
    if (!head) return;
    var onDark = head.classList.contains('on-dark');
    var threshold = onDark ? (window.innerHeight * 0.72) : 40;
    function onScroll() {
      head.classList.toggle('is-solid', window.scrollY > threshold);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      threshold = onDark ? (window.innerHeight * 0.72) : 40;
      onScroll();
    });
  }

  /* ---------- mobile nav ---------- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
    document.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || !items.length) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initLang();
    initHeader();
    initNav();
    initReveal();
  });
})();
