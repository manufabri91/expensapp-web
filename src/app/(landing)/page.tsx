import { WavesBottom, WavesTop } from '@/components';

import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Engage } from './components/Engage';

export default function Landing() {
  return (
    <section className="flex-1 bg-gradient-to-r from-sky-500 to-green-500 dark:from-slate-800 dark:from-15% dark:via-sky-700 dark:to-green-700">
      <Hero />
      <WavesTop />
      <Features />
      <WavesBottom />
      <Engage />
    </section>
  );
}
