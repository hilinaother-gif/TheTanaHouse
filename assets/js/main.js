// The Tana House — small, dependency-free site interactions.
// Set either special to "" to hide that language's announcement.
const SPECIAL = "Breakfast, lunch & a warm welcome. Every day, 7 AM–3 PM.";
const SPECIAL_ES = "Desayunos, almuerzos y una cálida bienvenida. Todos los días, 7 AM–3 PM.";
// Opening hours use Minneapolis time; greetings use each visitor's local time.
const HOURS = { 0: [7, 15], 1: [7, 15], 2: [7, 15], 3: [7, 15], 4: [7, 15], 5: [7, 15], 6: [7, 15] };
const TIMEZONE = "America/Chicago";

(function () {
  const LANG = (document.documentElement.lang || 'en').split('-')[0];
  const ES = LANG === 'es';
  const locales = window.TANA_LOCALES || {};
  const L = locales[LANG] || locales.en;
  const format = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
  const formatCount = count => format(count === 1 ? L.dishOne : L.dishMany, { count });
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionPreference.matches;
  motionPreference.addEventListener('change', event => { reducedMotion = event.matches; });
  const store = {
    get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { sessionStorage.setItem(key, value); } catch {} }
  };

  // Time-of-day greeting, including when a tab is left open across noon.
  const greeting = $('[data-time-greeting]');
  const greetingDetail = $('[data-greeting-detail]');
  const greetings = L.greetings;
  function paintGreeting() {
    if (!greeting) return;
    const hour = new Date().getHours();
    const period = hour < 12 ? 0 : hour < 18 ? 1 : 2;
    if (greeting.textContent !== greetings[period]) greeting.textContent = greetings[period];
    if (ES && greetingDetail) greetingDetail.textContent = period === 0 ? 'hechos con' : 'hechas con';
  }

  const banner = $('.special-banner');
  if (banner) {
    const message = LANG === 'en' ? SPECIAL : ES ? SPECIAL_ES : L.special;
    if (message && !store.get('tana-special-closed')) {
      $('.special-text', banner).textContent = message;
      banner.hidden = false;
      $('.special-close', banner).addEventListener('click', () => {
        banner.hidden = true;
        store.set('tana-special-closed', '1');
      });
    }
  }

  const header = $('.site-header');
  const toggle = $('.nav-toggle');
  const languagePicker = $('.language-picker');
  const categoryBar = $('.menu-tabs');
  const categoryList = $('.menu-category-list');
  const fitHeaderPanels = () => {
    const viewport = window.visualViewport;
    const bottom = (viewport ? viewport.offsetTop + viewport.height : innerHeight) - 12;
    if (header) {
      const bounds = header.getBoundingClientRect();
      const height = Math.ceil(bounds.height) + 'px';
      if (document.documentElement.style.getPropertyValue('--header-height') !== height) document.documentElement.style.setProperty('--header-height', height);
      document.documentElement.style.setProperty('--navigation-space', Math.max(44, bottom - bounds.bottom) + 'px');
    }
    const menuHeight = categoryBar && categoryList && getComputedStyle(categoryList).flexDirection === 'row' ? Math.ceil(categoryBar.getBoundingClientRect().height) : 0;
    const menuOffset = menuHeight + 'px';
    if (document.documentElement.style.getPropertyValue('--sticky-menu-height') !== menuOffset) document.documentElement.style.setProperty('--sticky-menu-height', menuOffset);
    if (languagePicker && languagePicker.open) {
      const top = $('.language-options', languagePicker).getBoundingClientRect().top;
      languagePicker.style.setProperty('--language-space', Math.max(44, bottom - top) + 'px');
    }
  };
  const onScroll = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 10);
    if (document.body.classList.contains('nav-open') || languagePicker?.open) fitHeaderPanels();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', fitHeaderPanels, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', fitHeaderPanels, { passive: true });
    window.visualViewport.addEventListener('scroll', fitHeaderPanels, { passive: true });
  }
  onScroll();
  fitHeaderPanels();
  if ('ResizeObserver' in window) {
    const sizes = new ResizeObserver(fitHeaderPanels);
    if (header) sizes.observe(header);
    if (categoryBar) sizes.observe(categoryBar);
  }
  if (document.fonts) document.fonts.ready.then(fitHeaderPanels);
  const closeNavigation = (restoreFocus = false) => {
    document.body.classList.remove('nav-open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      if (restoreFocus) toggle.focus();
    }
  };
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(open));
      if (open) { if (languagePicker) languagePicker.open = false; fitHeaderPanels(); }
    });
    $$('.nav-links a').forEach(link => link.addEventListener('click', () => closeNavigation()));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && document.body.classList.contains('nav-open')) closeNavigation(true);
    });
    document.addEventListener('click', event => {
      if (header && !header.contains(event.target)) closeNavigation();
    });
    window.matchMedia('(min-width: 55.0625em)').addEventListener('change', event => {
      if (event.matches) closeNavigation();
    });
  }

  function localNow() {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    const get = type => parts.find(part => part.type === type).value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day, mins: (+get('hour') % 24) * 60 + (+get('minute')) };
  }
  const fmt = hour => `${hour % 12 || 12} ${hour >= 12 ? 'PM' : 'AM'}`;
  const DAYS = L.days;
  const T = {
    openUntil: hour => format(L.status.openUntil, { hour: fmt(hour) }),
    closesAt: hour => format(L.status.closesAt, { hour: fmt(hour) }),
    opensToday: hour => format(L.status.opensToday, { hour: fmt(hour) }),
    opensOn: (day, offset, hour) => format(offset === 1 ? L.status.opensTomorrow : L.status.opensOn, { day, hour: fmt(hour) }),
    closed: L.status.closed
  };
  function status() {
    const { day, mins } = localNow();
    const today = HOURS[day];
    if (today && mins >= today[0] * 60 && mins < today[1] * 60) {
      return { open: true, text: today[1] * 60 - mins <= 60 ? T.closesAt(today[1]) : T.openUntil(today[1]) };
    }
    if (today && mins < today[0] * 60) return { open: false, text: T.opensToday(today[0]) };
    for (let offset = 1; offset <= 7; offset++) {
      const nextDay = (day + offset) % 7;
      if (HOURS[nextDay]) return { open: false, text: T.opensOn(DAYS[nextDay], offset, HOURS[nextDay][0]) };
    }
    return { open: false, text: T.closed };
  }
  function paintStatus() {
    let current;
    try { current = status(); } catch { return; }
    $$('.open-status').forEach(element => {
      element.classList.toggle('is-open', current.open);
      $('.open-text', element).textContent = current.text;
      element.hidden = false;
    });
  }
  function paintClock() { paintGreeting(); paintStatus(); }
  paintClock();
  setInterval(paintClock, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) paintClock(); });

  $$('.lang-switch').forEach(link => link.addEventListener('click', () => {
    if (location.hash) link.href = link.getAttribute('href').split('#')[0] + location.hash;
  }));
  if (languagePicker) {
    languagePicker.addEventListener('toggle', () => {
      document.body.classList.toggle('language-open', languagePicker.open);
      if (languagePicker.open) { closeNavigation(); fitHeaderPanels(); }
    });
    document.addEventListener('click', event => { if (!languagePicker.contains(event.target)) languagePicker.open = false; });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && languagePicker.open) {
        languagePicker.open = false;
        $('summary', languagePicker).focus();
      }
    });
  }
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Optional authentic content. All text is inserted as text, never HTML.
  const content = window.TANA_CONTENT || {};
  const translated = value => typeof value === 'string' ? value : value && (value[LANG] || value.en || value.es) || '';
  function safeUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, document.baseURI);
      return ['https:', 'http:', 'file:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }
  const gallery = $('[data-restaurant-gallery]');
  if (gallery && Array.isArray(content.gallery)) {
    const items = $('[data-gallery-items]', gallery);
    content.gallery.forEach(photo => {
      const src = safeUrl(photo.src);
      const alt = translated(photo.alt);
      if (!src || !alt) return;
      const figure = document.createElement('figure');
      const frame = document.createElement('div');
      frame.className = 'photo';
      const image = document.createElement('img');
      image.alt = alt;
      image.width = 1200;
      image.height = 900;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.addEventListener('error', () => { figure.remove(); if (!items.children.length) gallery.hidden = true; });
      image.src = src;
      frame.append(image);
      figure.append(frame);
      const caption = translated(photo.caption);
      if (caption) {
        const label = document.createElement('figcaption');
        label.textContent = caption;
        figure.append(label);
      }
      items.append(figure);
    });
    gallery.hidden = !items.children.length;
  }
  const reviews = $('[data-guest-reviews]');
  if (reviews && Array.isArray(content.reviews)) {
    const items = $('[data-review-items]', reviews);
    content.reviews.forEach(review => {
      const sourceUrl = safeUrl(review.sourceUrl);
      const text = translated(review.text);
      if (!sourceUrl || !text || !review.author) return;
      const quote = document.createElement('blockquote');
      quote.className = 'review-card';
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      const footer = document.createElement('footer');
      const author = document.createElement('cite');
      author.textContent = review.author;
      const source = document.createElement('a');
      source.href = sourceUrl;
      source.target = '_blank';
      source.rel = 'noopener';
      source.textContent = review.sourceLabel || L.readReview;
      footer.append(author, source);
      quote.append(paragraph, footer);
      items.append(quote);
    });
    reviews.hidden = !items.children.length;
  }

  const tabs = $$('.menu-tabs a');
  const sections = $$('.menu-section');
  // Long category jumps go directly to the food; nearby sections scroll gently.
  $$('.menu-tabs a, .menu-highlight').forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute('href');
    const target = hash && hash.startsWith('#') ? document.getElementById(hash.slice(1)) : null;
    if (!target || (!reducedMotion && Math.abs(target.getBoundingClientRect().top) < innerHeight * 2)) return;
    event.preventDefault();
    if (location.hash !== hash) history.pushState(null, '', hash);
    target.scrollIntoView({ block: 'start', behavior: 'instant' });
  }));
  if (tabs.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.target.classList.contains('section-empty')) return;
        tabs.forEach(tab => {
          const active = tab.getAttribute('href') === '#' + entry.target.id;
          tab.classList.toggle('active', active);
          if (active) tab.setAttribute('aria-current', 'location');
          else tab.removeAttribute('aria-current');
          const list = tab.closest('ul');
          if (active && list.scrollWidth > list.clientWidth + 2) {
            list.scrollTo({ left: tab.offsetLeft - list.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2, behavior: reducedMotion ? 'auto' : 'smooth' });
          } else if (active && list.scrollHeight > list.clientHeight + 2) {
            list.scrollTo({ top: tab.offsetTop - list.offsetTop - (list.clientHeight - tab.offsetHeight) / 2, behavior: reducedMotion ? 'auto' : 'smooth' });
          }
        });
      });
    }, { rootMargin: '-30% 0px -55% 0px' });
    sections.forEach(section => observer.observe(section));
  }

  const search = $('#menu-search');
  const chips = $$('.filter-chip');
  if (search || chips.length) {
    const empty = $('.no-results');
    const counter = $('.filter-count');
    const resetButtons = $$('[data-reset-menu]');
    const clearSearch = $('[data-clear-search]');
    const normalize = text => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const focusSearch = () => {
      if (!search) return;
      const far = Math.abs(search.getBoundingClientRect().top - innerHeight / 2) > innerHeight * 2;
      search.scrollIntoView({ block: 'center', behavior: reducedMotion || far ? 'instant' : 'smooth' });
      search.focus({ preventScroll: true });
    };
    let filter = 'all';
    const apply = () => {
      const query = search ? normalize(search.value.trim()) : '';
      let total = 0;
      const entering = [];
      sections.forEach(section => {
        let shown = 0;
        $$('.item', section).forEach(item => {
          const tags = (item.dataset.tags || '').split(' ');
          const matches = (!query || normalize(item.textContent + ' ' + (item.dataset.search || '')).includes(query)) && (filter === 'all' || tags.includes(filter));
          if (matches && item.classList.contains('hidden')) entering.push(item);
          item.classList.toggle('hidden', !matches);
          if (matches) shown++;
        });
        section.classList.toggle('section-empty', shown === 0);
        const sectionCount = $('[data-section-count]', section);
        if (sectionCount) sectionCount.textContent = formatCount(shown);
        tabs.filter(tab => tab.getAttribute('href') === '#' + section.id).forEach(tab => {
          tab.parentElement.hidden = shown === 0;
          const count = $('.menu-category-count', tab);
          if (count) count.textContent = shown;
        });
        total += shown;
      });
      if (empty) empty.classList.toggle('show', total === 0);
      if (counter) counter.textContent = formatCount(total);
      if (clearSearch) clearSearch.hidden = !search.value;
      $$('[data-filter-reset]').forEach(button => { button.hidden = !query && filter === 'all'; });
      const visibleTabs = tabs.filter(tab => !tab.parentElement.hidden);
      if (!visibleTabs.some(tab => tab.classList.contains('active'))) {
        tabs.forEach(tab => { tab.classList.remove('active'); tab.removeAttribute('aria-current'); });
        if (visibleTabs[0]) { visibleTabs[0].classList.add('active'); visibleTabs[0].setAttribute('aria-current', 'location'); }
      }
      document.dispatchEvent(new CustomEvent('tana:menu-updated', { detail: { items: entering } }));
    };
    if (search) search.addEventListener('input', apply);
    if (search) {
      const syncSearchFocus = () => document.body.classList.toggle('search-focused', document.activeElement === search);
      search.addEventListener('focus', syncSearchFocus);
      search.addEventListener('blur', syncSearchFocus);
      search.addEventListener('keydown', event => {
        if (event.key === 'Escape') { event.preventDefault(); search.blur(); }
      });
    }
    chips.forEach(chip => chip.addEventListener('click', () => {
      filter = chip.dataset.filter;
      chips.forEach(button => button.setAttribute('aria-pressed', String(button === chip)));
      apply();
    }));
    resetButtons.forEach(reset => reset.addEventListener('click', () => {
      if (search) search.value = '';
      filter = 'all';
      chips.forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.filter === 'all')));
      apply();
      focusSearch();
    }));
    if (clearSearch) clearSearch.addEventListener('click', () => {
      search.value = '';
      apply();
      search.focus();
    });
    $$('[data-menu-search-jump]').forEach(button => button.addEventListener('click', () => {
      focusSearch();
    }));
    apply();
  }
})();
