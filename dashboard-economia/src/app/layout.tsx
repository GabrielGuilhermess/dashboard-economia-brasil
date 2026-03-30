import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';

import { Providers } from '@/lib/providers';

import '@/styles/globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  title: 'Dashboard Economia Brasileira',
  description: 'Visualizações interativas de indicadores econômicos do Brasil.',
  openGraph: {
    title: 'Dashboard Economia Brasileira',
    description: 'Indicadores, mapa, séries históricas e distribuição do PIB do Brasil.',
    images: ['/og-dashboard-economia.svg'],
  },
};

const themeScript = `
  try {
    const raw = localStorage.getItem('dashboard-economia-ui');
    if (!raw) {
      document.documentElement.classList.remove('dark');
    } else {
      const parsed = JSON.parse(raw);
      const theme = parsed?.state?.theme;
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  } catch (error) {
    document.documentElement.classList.remove('dark');
  }
`;

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${dmSans.variable} ${playfairDisplay.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen text-text-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
