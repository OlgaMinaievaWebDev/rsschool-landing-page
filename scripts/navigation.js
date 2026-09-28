(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.site-nav');
  if (!header || !toggle || !navigation) return;

  const mobile = window.matchMedia('(max-width: 768px)');
  const background = [...document.querySelectorAll('main, footer')];
  let open = false;

  const setOpen = (next, restoreFocus = false) => {
    open = next && mobile.matches;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    document.documentElement.classList.toggle('navigation-open', open);
    navigation.inert = mobile.matches && !open;
    background.forEach((element) => { element.inert = open; });
    if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(!open));
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false, true);
    }
    if (event.key === 'Tab') {
      const controls = [...header.querySelectorAll('a[href], button:not([disabled])')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  mobile.addEventListener('change', () => {
    const focused = document.activeElement;
    setOpen(false);
    if (mobile.matches && navigation.contains(focused)) toggle.focus();
    else if (!mobile.matches && focused === toggle) navigation.querySelector('a').focus();
  });
  setOpen(false);
})();
