import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import { Footer, Navbar } from "@/components";

import "./globals.css";
import { Flowbite, ThemeModeScript } from "flowbite-react";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "e-XpensApp | Expense tracking made easy",
    template: "%s | e-XpensApp",
  },
  description: "Expense tracking made easy",
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
              base: "border-2 border-teal-600",
              color: {
                primary: "text-white bg-teal-600 hover:bg-teal-700",
                secondary:
                  "bg-gray-100 dark:bg-slate-900 text-teal-600 hover:text-teal-600/75 dark:hover:bg-stone-100/20 dark:hover:text-teal-600",
              },
            },
          },
        }}
      >
        <body
          className={`${montserrat.className} antialiased bg-stone-100 dark:bg-slate-950`}
        >
          <div className="min-h-screen flex flex-col justify-between">
            <div className="relative">
              <Navbar />
              {children}
            </div>
            <Footer />
          </div>
        </body>
      </Flowbite>
    </html>
  );
}
