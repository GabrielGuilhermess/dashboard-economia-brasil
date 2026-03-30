'use client';

import { PeriodSelector } from '@/components/filters/period-selector';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-border bg-bg-page/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-tertiary">
          Dashboard economia brasileira
        </p>
        <h1 className="text-3xl font-semibold">Panorama macro em tempo real</h1>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <PeriodSelector />
        <ThemeToggle />
      </div>
    </header>
  );
}

Header.displayName = 'Header';
