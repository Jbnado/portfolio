import { useState, useEffect, useRef } from 'preact/hooks';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const isAnimating = useRef(false);

  useEffect(() => {
    const current = document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light';
    setTheme(current);
  }, []);

  const toggle = () => {
    if (isAnimating.current) return;

    const next = theme === 'light' ? 'dark' : 'light';
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      document.documentElement.classList.remove(theme);
      document.documentElement.classList.add(next);
      localStorage.setItem('theme', next);
      document.querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', next === 'dark' ? '#0c0a09' : '#faf9f6');
      setTheme(next);
      return;
    }

    isAnimating.current = true;

    const overlay = document.createElement('div');
    overlay.className = `theme-transition-overlay theme-transition-overlay--to-${next}`;
    document.body.appendChild(overlay);

    // Swap theme at midpoint (400ms into 1s animation)
    setTimeout(() => {
      document.documentElement.classList.remove(theme);
      document.documentElement.classList.add(next);
      localStorage.setItem('theme', next);
      document.querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', next === 'dark' ? '#0c0a09' : '#faf9f6');
      setTheme(next);
    }, 400);

    const cleanup = () => {
      overlay.remove();
      isAnimating.current = false;
    };

    overlay.addEventListener('animationend', cleanup, { once: true });

    // Safety timeout fallback
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        cleanup();
      }
    }, 1200);
  };

  const label =
    theme === 'dark'
      ? 'Mudar para modo claro'
      : 'Mudar para modo escuro';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      role="switch"
      aria-checked={theme === 'dark'}
      class="theme-toggle"
    >
      {theme === 'dark' ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="square"
          stroke-linejoin="bevel"
        >
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="1" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
          <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
          <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
          {/* Extra punk rays */}
          <line x1="12" y1="0" x2="12" y2="1" opacity="0.5" />
          <line x1="0" y1="12" x2="1" y2="12" opacity="0.5" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          {/* Punk notch marks */}
          <line x1="14" y1="4" x2="15" y2="5" opacity="0.4" />
          <line x1="19" y1="9" x2="20" y2="10" opacity="0.4" />
        </svg>
      )}
    </button>
  );
}
