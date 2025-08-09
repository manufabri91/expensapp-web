import { PropsWithChildren } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import { Montserrat } from 'next/font/google';
import { Flowbite, ThemeModeScript } from 'flowbite-react';

import './globals.css';
import { AppProviders } from '@/lib/providers';
import { Footer, Navbar, Toast } from '@/components';
import { ToastProvider } from '@/components/Toast/ToastProvider';

const montserrat = Montserrat({ subsets: ['latin'] });

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
      </head>
      <Flowbite
        // eslint-disable-next-line tailwindcss/no-custom-classname
        theme={{
          mode: 'auto',
        }}
      >
        <body
          className={`${montserrat.className} bg-stone-100 text-black antialiased dark:bg-slate-950 dark:text-white`}
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
