'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-page px-6 text-center">
      <div className="max-w-md rounded-[1.75rem] border border-border bg-bg-card p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-tertiary">
          Dashboard economia brasileira
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">
          Redirecionando para a dashboard
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          Se a navegação não acontecer automaticamente, abra a rota principal da
          dashboard pelo link abaixo.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-full bg-accent-primary px-5 py-3 text-sm font-semibold text-text-inverse transition-opacity hover:opacity-90"
        >
          Ir para /dashboard
        </Link>
      </div>
    </main>
  );
}
