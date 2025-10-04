import '@/styles/globals.css';
import clsx from 'clsx';
import { Viewport } from 'next';

import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import { PropsWithChildren } from 'react';
import { Navbar } from '@/components';
import { Footer } from '@/components/Footer';
import { fontBrand, fontSans } from '@/config/fonts';
import { AppProviders } from '@/lib/providers';
import { Providers } from './providers';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: {
      default: t('title.default'),
      template: t('title.template'),
    },
    description: t('description'),
  };
}

export default async function RootLayout({ children }: PropsWithChildren) {
  const locale = await getLocale();
  return (
    <html suppressHydrationWarning lang={locale}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1f2937" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={clsx(
          fontBrand.variable,
          fontSans.variable,
          'text-foreground bg-background min-h-screen font-sans antialiased'
        )}
      >
        <NextIntlClientProvider>
          <Providers themeProps={{ attribute: 'class', enableSystem: true }}>
            <div className="relative flex h-screen w-screen flex-col">
              <Navbar />
              <AppProviders>
                <main className="container-full flex-grow">{children}</main>
              </AppProviders>
              <Footer />
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
