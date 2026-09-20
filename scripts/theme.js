(() => {
  const storageKey = 'coffee-house-theme';
  const root = document.documentElement;
  let theme = 'light';

  try {
    if (localStorage.getItem(storageKey) === 'dark') {
      theme = 'dark';
    }
  } catch {}

  root.dataset.theme = theme;

  document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.theme-toggle');
    if (!button) return;

    const updateButton = () => {
      const isDark = root.dataset.theme === 'dark';
      button.setAttribute(
        'aria-label',
        `Switch to ${isDark ? 'light' : 'dark'} theme`,
      );
    };

    updateButton();

    button.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      updateButton();

      try {
        localStorage.setItem(storageKey, root.dataset.theme);
      } catch {}
    });
  });
})();
