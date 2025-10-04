import { WavesBottom, WavesTop } from '@/components';

import { Engage } from './components/Engage';
import { Features } from './components/Features';
import { Hero } from './components/Hero';

export default function Landing() {
  return (
    <section className="bg-gradient-to-r from-sky-500 to-green-500 dark:from-slate-800 dark:from-15% dark:via-sky-700 dark:to-green-700">
      <Hero />
      <WavesTop />
      <Features />
      <WavesBottom />
      <Engage />
    </section>
  );
}
