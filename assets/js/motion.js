// Gentle entrances and interaction feedback; content is always visible by default.
(function () {
  if (!Element.prototype.animate) return;

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const seen = new WeakSet();
  const delays = new WeakMap();
  const active = new Map();
  const easing = 'cubic-bezier(.22, 1, .36, 1)';
  const rise = [
    { opacity: 0, transform: 'translate3d(0, 16px, 0)' },
    { opacity: 1, transform: 'none' }
  ];
  const photos = '.hero-art, .feature-art, .story-art, .gallery-grid > figure';
  const targets = Array.from(document.querySelectorAll([
    '.section-heading', '.fav-card', '.feature-copy', '.feature-art',
    '.story-art', '.story > .section-sketch', '.story > h2', '.story-lead', '.story-points > div',
    '.visit-heading', '.visit-card > div', '.menu-section-head', '.item',
    '.toppings', '.menu-cta', '.gallery-grid > figure', '.review-card'
  ].join(', ')));
  let started = false;

  document.querySelectorAll('.fav-grid, .story-points, .visit-card, .items, .gallery-grid, .review-grid').forEach(group => {
    Array.from(group.children).forEach((element, index) => delays.set(element, Math.min(index, 3) * 65));
  });

  function animate(element, frames, options = {}) {
    if (preference.matches || document.hidden || element.contains(document.activeElement) || !element.getClientRects().length) return;
    element.dataset.motion = 'reveal';
    const previous = active.get(element);
    if (previous) previous.cancel();
    const animation = element.animate(frames, { duration: 750, easing, fill: 'backwards', ...options });
    active.set(element, animation);
    const clean = () => { if (active.get(element) === animation) active.delete(element); };
    animation.finished.then(clean, clean);
  }

  function reveal(element, options = {}) {
    seen.add(element);
    element.dataset.motionRevealed = 'true';
    const photo = element.matches(photos);
    const frames = photo ? [
      { opacity: 0, transform: 'translate3d(0, 14px, 0)', clipPath: 'inset(0 0 4% 0)' },
      { opacity: 1, transform: 'none', clipPath: 'inset(0)' }
    ] : rise;
    animate(element, frames, { delay: delays.get(element) || 0, ...options });
    if (photo) {
      const image = element.querySelector('img');
      if (image) animate(image, [{ transform: 'scale(1.035)' }, { transform: 'scale(1)' }], { duration: 1600, delay: options.delay || 0 });
    }
  }

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || seen.has(entry.target)) return;
      reveal(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: .1, rootMargin: '0px 0px -20px 0px' }) : null;

  function observeSections() {
    if (!observer || preference.matches || document.hidden) return;
    targets.forEach(element => {
      if (seen.has(element)) return;
      if (element.getBoundingClientRect().bottom <= 0) seen.add(element);
      else observer.observe(element);
    });
  }

  function stopMotion() {
    active.forEach(animation => animation.cancel());
    active.clear();
    if (observer) observer.disconnect();
  }

  function startMotion() {
    if (started) return;
    started = true;
    if (preference.matches) return;
    const brand = document.querySelector('.brand');
    if (brand) reveal(brand, { duration: 650 });
    const intro = document.querySelectorAll('.hero-copy > *, .menu-hero h1, .menu-intro-lead, .menu-intro-meta');
    intro.forEach((element, index) => reveal(element, { delay: Math.min(index, 3) * 95, duration: 850 }));
    const hero = document.querySelector('.hero-art');
    if (hero) reveal(hero, { delay: 50, duration: 950 });
    observeSections();
  }

  if (window.TANA_WELCOME_PENDING) document.addEventListener('tana:welcome-dismissed', startMotion, { once: true });
  else startMotion();

  preference.addEventListener('change', event => {
    if (event.matches) stopMotion();
    else if (started) observeSections();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopMotion();
    else if (started) observeSections();
  });

  // Keyboard focus cancels any entrance affecting its target immediately.
  document.addEventListener('focusin', event => {
    active.forEach((animation, element) => {
      if (element.contains(event.target)) animation.cancel();
    });
    const target = event.target.closest('[data-motion]');
    if (target) {
      seen.add(target);
      target.dataset.motionRevealed = 'true';
      if (observer) observer.unobserve(target);
    }
  });

  // Filtering stays instant; only newly restored, visible results receive a short fade.
  document.addEventListener('tana:menu-updated', event => {
    if (!started || preference.matches || window.TANA_WELCOME_PENDING) return;
    let index = 0;
    (event.detail.items || []).forEach(element => {
      const bounds = element.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= innerHeight) return;
      seen.add(element);
      element.dataset.motionRevealed = 'true';
      if (observer) observer.unobserve(element);
      animate(element, [
        { opacity: 0, transform: 'translate3d(0, 6px, 0)' },
        { opacity: 1, transform: 'none' }
      ], { duration: 300, delay: Math.min(index++, 3) * 35 });
    });
  });
})();
