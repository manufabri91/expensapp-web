import { PropsWithChildren } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import { Montserrat, Miriam_Libre } from 'next/font/google';
import { Flowbite, ThemeModeScript } from 'flowbite-react';

import './globals.css';
import { AppProviders } from '@/lib/providers';
import { Footer, Navbar, Toast } from '@/components';
import { ToastProvider } from '@/components/Toast/ToastProvider';

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });
const poppins = Miriam_Libre({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

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
    <html lang={locale} suppressHydrationWarning>
      <head>
        <ThemeModeScript />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1f2937" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <Flowbite
        // eslint-disable-next-line tailwindcss/no-custom-classname
        theme={{
          mode: 'auto',
        }}
      >
        <body
          className={`${poppins.variable} ${montserrat.variable} bg-stone-100 font-Montserrat text-black antialiased dark:bg-slate-950 dark:text-white`}
        >
          <NextIntlClientProvider>
            <ToastProvider>
              <div className="flex h-svh max-h-svh w-full">
                <div className="h-full flex-1">
                  <div className="flex h-full flex-col justify-between">
                    <Navbar />
                    <AppProviders>
                      <div className="flex-1">{children}</div>
                    </AppProviders>
                    <Toast />
                    <Footer />
                  </div>
                </div>
              </div>
            </ToastProvider>
          </NextIntlClientProvider>
        </body>
      </Flowbite>
    </html>
  );
}
