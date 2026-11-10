// A small welcome, once per tab session, shared by every language and entry page.
(function () {
  const key = 'tana-welcome-seen';
  const lang = (document.documentElement.lang || 'en').split('-')[0];
  const words = (window.TANA_LOCALES[lang] || window.TANA_LOCALES.en).welcome;
  if (!words || typeof HTMLDialogElement === 'undefined' || !HTMLDialogElement.prototype.showModal) return;
  try { if (sessionStorage.getItem(key)) return; } catch {}

  window.TANA_WELCOME_PENDING = true;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dialog = document.createElement('dialog');
  dialog.className = 'welcome-dialog';
  dialog.setAttribute('aria-labelledby', 'welcome-title');
  dialog.setAttribute('aria-describedby', 'welcome-saying');
  dialog.innerHTML = `
    <button class="welcome-close" type="button" data-welcome-close><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
    <div class="welcome-content">
      <div class="welcome-mark" aria-hidden="true"><span class="welcome-halo"></span><img src="assets/img/logo-emblem.png" width="90" height="62" alt=""><span class="welcome-spark welcome-spark-one">✦</span><span class="welcome-spark welcome-spark-two">✧</span></div>
      <p class="welcome-eyebrow" data-welcome="eyebrow"></p>
      <h2 id="welcome-title" class="welcome-title" tabindex="-1"><span data-welcome="title"></span><em data-welcome="accent"></em></h2>
      <p class="welcome-saying" id="welcome-saying" data-welcome="saying"></p>
      <p class="welcome-note" data-welcome="note"></p>
      <div class="welcome-actions"><a class="btn btn-primary welcome-menu" data-welcome-menu><span data-welcome="menu"></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a><button class="welcome-dismiss" type="button" data-welcome-close data-welcome="dismiss"></button></div>
      <p class="welcome-hours" data-welcome="hours"></p>
    </div>`;
  dialog.querySelectorAll('[data-welcome]').forEach(element => {
    element.textContent = words[element.dataset.welcome];
  });
  dialog.querySelector('.welcome-close').setAttribute('aria-label', words.close);
  const menu = dialog.querySelector('[data-welcome-menu]');
  menu.href = 'menu' + (lang === 'en' ? '' : '-' + lang) + '.html';
  document.body.append(dialog);

  let closing = false;
  let closeTimer;
  let nextFocus;
  const finishClose = () => { clearTimeout(closeTimer); dialog.close(); };
  function dismiss(focusTarget) {
    if (!dialog.open || closing) return;
    closing = true;
    nextFocus = focusTarget;
    if (motion.matches) finishClose();
    else {
      dialog.classList.add('is-closing');
      closeTimer = setTimeout(finishClose, 180);
    }
  }
  dialog.querySelectorAll('[data-welcome-close]').forEach(button => {
    button.addEventListener('click', () => dismiss());
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = Array.from(dialog.querySelectorAll('button:not([disabled]), a[href]'));
    const first = controls[0];
    const last = controls[controls.length - 1];
    const outsideControls = !controls.includes(document.activeElement);
    if (event.shiftKey && (document.activeElement === first || outsideControls)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || outsideControls)) {
      event.preventDefault();
      first.focus();
    }
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dismiss();
  });
  menu.addEventListener('click', event => {
    if (!document.body.classList.contains('menu-page') || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    dismiss(document.querySelector('#menu-search'));
  });
  motion.addEventListener('change', event => { if (event.matches && closing) finishClose(); });

  function releasePage() {
    document.documentElement.classList.remove('welcome-open');
    window.TANA_WELCOME_PENDING = false;
    // The page entrance begins after the welcome, so visitors actually see it.
    document.dispatchEvent(new CustomEvent('tana:welcome-dismissed'));
  }
  dialog.addEventListener('close', () => {
    releasePage();
    if (nextFocus) {
      nextFocus.scrollIntoView({ block: 'center', behavior: 'instant' });
      nextFocus.focus({ preventScroll: true });
    }
    dialog.remove();
  }, { once: true });

  function showWelcome() {
    if (document.hidden) return;
    document.removeEventListener('visibilitychange', showWelcome);
    try {
      dialog.showModal();
      document.documentElement.classList.add('welcome-open');
      dialog.querySelector('#welcome-title').focus({ preventScroll: true });
      try { sessionStorage.setItem(key, '1'); } catch {}
    } catch {
      dialog.remove();
      releasePage();
    }
  }
  setTimeout(() => {
    if (document.hidden) document.addEventListener('visibilitychange', showWelcome);
    else showWelcome();
  }, 300);
})();
