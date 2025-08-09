import { RegisterButton } from '@/components/RegisterButton';
import { getTranslations } from 'next-intl/server';

export const Engage = async () => {
  const t = await getTranslations('HomePage');
  return (
    <section className="container mx-auto mb-12 py-6 text-center">
      <h2 className="my-6 w-full text-center text-5xl font-bold leading-tight">{t('engage.title')}</h2>
      <div className="mb-6 w-full">
        <div className="mx-auto my-0 h-1 w-1/6 rounded-t bg-white py-0 opacity-25"></div>
      </div>
      <h3 className="mb-12 text-3xl leading-tight">{t('engage.subtitle')}</h3>
      <div className="flex w-full justify-center">
        <RegisterButton />
      </div>
    </section>
  );
};
