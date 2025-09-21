import { Miriam_Libre, Montserrat } from "next/font/google";

export const fontSans =  Montserrat({ subsets: ['latin'], variable: '--font-sans' });
export const fontBrand = Miriam_Libre({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-brand',
});