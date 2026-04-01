'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Indicator, PeriodFilter, Theme } from '@/types/economia';

interface DashboardState {
  theme: Theme;
  period: PeriodFilter;
  activeIndicators: Indicator[];
  hoveredUF: string | null;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setPeriod: (period: PeriodFilter) => void;
  toggleIndicator: (indicator: Indicator) => void;
  setIndicators: (indicators: Indicator[]) => void;
  setHoveredUF: (uf: string | null) => void;
}

const DEFAULT_INDICATORS: Indicator[] = ['selic', 'ipca'];

function normalizeActiveIndicators(indicators?: Indicator[]): Indicator[] {
  const filteredIndicators = (indicators ?? []).filter((indicator) =>
    DEFAULT_INDICATORS.includes(indicator),
  );

  return filteredIndicators.length > 0 ? filteredIndicators : DEFAULT_INDICATORS;
}

function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      period: '1Y',
      activeIndicators: DEFAULT_INDICATORS,
      hoveredUF: null,
      toggleTheme: () => {
        const nextTheme = get().theme === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme);
        set({ theme: nextTheme });
      },
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      setPeriod: (period) => set({ period }),
      toggleIndicator: (indicator) => {
        const currentIndicators = normalizeActiveIndicators(get().activeIndicators);
        const nextIndicators = currentIndicators.includes(indicator)
          ? currentIndicators.filter((item) => item !== indicator)
          : [...currentIndicators, indicator];

        if (nextIndicators.length === 0) {
          return;
        }

        set({ activeIndicators: normalizeActiveIndicators(nextIndicators) });
      },
      setIndicators: (indicators) =>
        set({
          activeIndicators: normalizeActiveIndicators(indicators),
        }),
      setHoveredUF: (hoveredUF) => set({ hoveredUF }),
    }),
    {
      name: 'dashboard-economia-ui',
      merge: (persistedState, currentState) => {
        const typedPersistedState = persistedState as Partial<DashboardState> | undefined;

        return {
          ...currentState,
          ...typedPersistedState,
          activeIndicators: normalizeActiveIndicators(
            typedPersistedState?.activeIndicators,
          ),
        };
      },
      partialize: (state) => ({
        theme: state.theme,
        period: state.period,
        activeIndicators: state.activeIndicators,
      }),
    },
  ),
);
