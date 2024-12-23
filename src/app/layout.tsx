import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';

import { Footer, Navbar } from '@/components';

import './globals.css';
import { Flowbite, ThemeModeScript } from 'flowbite-react';
import { AppProviders } from '@/lib/providers';
import { ToastProvider } from '@/components/Toast/ToastProvider';

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'e-XpensApp | Expense tracking made easy',
    template: '%s | e-XpensApp',
  },
  description: 'Expense tracking made easy',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeModeScript />
      </head>
      <Flowbite
        theme={{
          mode: 'auto',
        }}
      >
        <body
          className={`${montserrat.className} bg-stone-100 text-black antialiased dark:bg-slate-950 dark:text-white`}
        >
          <ToastProvider>
            <div className="flex h-svh max-h-svh w-full">
              <div className="h-full flex-1">
                <div className="flex h-full flex-col justify-between overflow-y-scroll">
                  <Navbar />
                  <AppProviders>
                    <div className="flex-1">{children}</div>
                  </AppProviders>
                  <Footer />
                </div>
              </div>
            </div>
          </ToastProvider>
        </body>
      </Flowbite>
    </html>
  );
}
