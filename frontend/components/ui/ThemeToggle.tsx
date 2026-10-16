'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('slotly-theme');
    const enabled = saved === 'dark';
    document.documentElement.dataset.theme = enabled ? 'dark' : 'light';
    setDark(enabled);
  }, []);

  function toggleTheme() {
    const enabled = !dark;
    document.documentElement.dataset.theme = enabled ? 'dark' : 'light';
    window.localStorage.setItem('slotly-theme', enabled ? 'dark' : 'light');
    setDark(enabled);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
      title={`Switch to ${dark ? 'light' : 'dark'} mode`}
      className="grid size-10 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {dark ? (
        <Sun aria-hidden="true" className="size-4" />
      ) : (
        <Moon aria-hidden="true" className="size-4" />
      )}
    </button>
  );
}
