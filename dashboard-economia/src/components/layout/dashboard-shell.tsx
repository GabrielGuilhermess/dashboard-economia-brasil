'use client';

import { Header } from '@/components/layout/header';

/**
 * Props da casca principal do dashboard.
 */
export interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1440px] space-y-6">{children}</div>
      </main>
    </div>
  );
}

DashboardShell.displayName = 'DashboardShell';
