// One-time entrances and small interaction effects, with content visible by default.
(function () {
  if (!Element.prototype.animate) return;

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const seen = new WeakSet();
  const delays = new WeakMap();
  const active = new Map();
  const easing = 'cubic-bezier(.2,.7,.2,1)';
  const rise = [
    { opacity: 0, transform: 'translate3d(0, 28px, 0)' },
    { opacity: 1, transform: 'none' }
  ];
  const targets = Array.from(document.querySelectorAll([
    '.section-heading', '.fav-card', '.feature-copy', '.feature-list > li',
    '.category-links > a', '.story-art', '.story > .eyebrow', '.story > h2',
    '.story-lead', '.story-points > div', '.visit-copy', '.visit-card',
    '.menu-section-head', '.menu-section-art .photo', '.item', '.toppings',
    '.menu-cta', '.gallery-grid > figure', '.review-card'
  ].join(', ')));

  document.querySelectorAll('.fav-grid, .category-links, .story-points, .feature-list, .items, .gallery-grid, .review-grid').forEach(group => {
    Array.from(group.children).forEach((element, index) => delays.set(element, Math.min(index, 3) * 90));
  });
  targets.forEach(element => { element.dataset.motion = 'reveal'; });

  function animate(element, frames, options = {}) {
    if (preference.matches || document.hidden || element.contains(document.activeElement)) return;
    element.dataset.motion = 'reveal';
    const previous = active.get(element);
    if (previous) previous.cancel();
    const animation = element.animate(frames, {
      duration: 600, easing, fill: 'backwards', ...options
    });
    active.set(element, animation);
    const clean = () => { if (active.get(element) === animation) active.delete(element); };
    animation.finished.then(clean, clean);
  }

  function reveal(element, options = {}) {
    seen.add(element);
    element.dataset.motionRevealed = 'true';
    const frames = element.matches('.story-art, .menu-section-art .photo, .gallery-grid > figure') ? [
      { opacity: 0, transform: 'translate3d(0, 24px, 0) scale(.96)' },
      { opacity: 1, transform: 'none' }
    ] : rise;
    animate(element, frames, { delay: delays.get(element) || 0, ...options });
  }

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || seen.has(entry.target)) return;
      reveal(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: .08, rootMargin: '0px 0px -24px 0px' }) : null;

  function stopMotion() {
    active.forEach(animation => animation.cancel());
    active.clear();
    if (observer) observer.disconnect();
    targets.forEach(element => {
      seen.add(element);
      element.dataset.motionRevealed = 'true';
    });
  }

  function startMotion() {
    if (preference.matches) { stopMotion(); return; }
    const intro = document.querySelectorAll('.hero-copy > *, .menu-hero .eyebrow, .menu-hero h1, .menu-hero > .wrap > p, .menu-intro-lead, .menu-intro-meta, .menu-highlight');
    intro.forEach((element, index) => reveal(element, { delay: Math.min(index, 4) * 100, duration: 800 }));
    const hero = document.querySelector('.hero-art');
    if (hero) {
      animate(hero, [
        { opacity: 0, transform: 'translate3d(0, 28px, 0) scale(.96) rotate(1deg)' },
        { opacity: 1, transform: 'none' }
      ], { duration: 1100, delay: 160 });
      const image = hero.querySelector('.photo img');
      if (image) animate(image, [{ transform: 'scale(1.075)' }, { transform: 'scale(1)' }], { duration: 2600 });
    }
    if (observer) targets.forEach(element => observer.observe(element));
  }

  if (window.TANA_WELCOME_PENDING) document.addEventListener('tana:welcome-dismissed', startMotion, { once: true });
  else startMotion();

  // A live preference change stops active effects immediately.
  preference.addEventListener('change', event => { if (event.matches) stopMotion(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) active.forEach(animation => animation.cancel());
  });

  // Keyboard focus always receives an immediately visible target.
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

  // Animate only newly restored results, keeping typing and filtering immediate.
  document.addEventListener('tana:menu-updated', event => {
    let index = 0;
    (event.detail.items || []).forEach(element => {
      const bounds = element.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
      seen.add(element);
      element.dataset.motionRevealed = 'true';
      if (observer) observer.unobserve(element);
      animate(element, rise, { duration: 350, delay: Math.min(index++, 3) * 40 });
    });
  });
})();
