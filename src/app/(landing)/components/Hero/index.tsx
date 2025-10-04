import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { RegisterButton } from '@/components/RegisterButton';

export const Hero = async () => {
  const t = await getTranslations('HomePage.hero');
  return (
    <div className="pt-24">
      <div className="container mx-auto flex flex-col flex-wrap items-center px-3 md:flex-row">
        <div className="flex w-full flex-col items-start justify-center text-center sm:items-center md:w-2/5 md:text-left">
          <p className="w-full -tracking-wide uppercase">{t('title')}</p>
          <h1 className="my-4 w-full text-5xl leading-tight font-bold">{t('subtitle')}</h1>
          <p className="mb-8 text-2xl leading-normal">{t('description')}</p>
          <div className="flex w-full justify-center">
            <RegisterButton />
          </div>
        </div>
        <div className="w-full py-6 text-center md:w-3/5">
          <Image className="z-50 w-full md:w-4/5" src="/images/hero.svg" alt="" height={500} width={500} />
        </div>
      </div>
    </div>
  );
};
