import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import { Footer, Navbar } from "@/components";

import "./globals.css";

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
    </html>
  );
}
