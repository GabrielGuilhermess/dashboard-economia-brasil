'use client';

import { useDashboardStore } from '@/store/dashboard-store';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const theme = useDashboardStore((state) => state.theme);
  const toggleTheme = useDashboardStore((state) => state.toggleTheme);
  const nextTheme = theme === 'light' ? 'escuro' : 'claro';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-12 w-24 items-center rounded-full border border-border bg-bg-card px-1 shadow-sm transition-colors hover:bg-bg-secondary"
      aria-label={`Alternar para tema ${nextTheme}`}
    >
      <span
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full bg-accent-primary text-text-inverse transition-transform duration-300',
          theme === 'dark' ? 'translate-x-12' : 'translate-x-0',
        )}
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  );
}

ThemeToggle.displayName = 'ThemeToggle';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <path d="M21 12.79A9 9 0 1 1 11.21 3c-.01.18-.01.37-.01.56A8.5 8.5 0 0 0 20.44 12c.19 0 .38 0 .56-.01Z" />
    </svg>
  );
}
