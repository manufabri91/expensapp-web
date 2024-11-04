import type { Metadata } from 'next';

import { Footer, Navbar } from '@/components';

import './globals.css';
import { Flowbite, ThemeModeScript } from 'flowbite-react';

// const montserrat = Montserrat({ subsets: ["latin"] });

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
    <html lang="en">
      <head>
        <ThemeModeScript />
      </head>
      <Flowbite
        theme={{
          theme: {
            button: {
              base: 'border-2 border-teal-600',
              color: {
                primary: 'bg-teal-600 text-white hover:bg-teal-700',
                secondary:
                  'bg-gray-100 text-teal-600 hover:text-teal-600/75 dark:bg-slate-900 dark:hover:bg-stone-100/20 dark:hover:text-teal-600',
              },
            },
          },
        }}
      >
        <body className={`bg-stone-100 antialiased dark:bg-slate-950`}>
          <div className="flex min-h-screen flex-col justify-between">
            <div className="relative">
              <Navbar />
              <section className="relative h-full bg-white dark:bg-gray-900">{children}</section>
            </div>
            <Footer />
          </div>
        </body>
      </Flowbite>
    </html>
  );
}
