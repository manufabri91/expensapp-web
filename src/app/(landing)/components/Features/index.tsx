import Image from 'next/image';
import { HR } from 'flowbite-react';
import { getTranslations } from 'next-intl/server';

export const Features = async () => {
  const t = await getTranslations('HomePage');
  return (
    <section className="bg-stone-100 py-8 dark:bg-slate-950">
      <div className="container m-8 mx-auto max-w-5xl">
        <h2 className="my-2 w-full text-center text-5xl font-bold leading-tight text-gray-800 dark:text-stone-100">
          {t('features.title')}
        </h2>
        <div className="mb-4 w-full">
          <div className="mx-auto my-0 h-1 w-64 rounded-t bg-gradient-to-r from-sky-500 to-green-500 py-0 opacity-25"></div>
        </div>
        <div className="flex w-full flex-col flex-wrap sm:flex-row">
          <div className="w-full content-center p-6 sm:w-1/2">
            <h3 className="mb-3 text-3xl font-bold leading-none text-gray-800 dark:text-stone-100">
              {t('features.1.title')}
            </h3>
            <p className="mb-8 text-gray-600 dark:text-stone-200">{t('features.1.description')}</p>
          </div>
          <div className="relative mt-6 hidden w-full flex-1 p-6 sm:block sm:h-96 sm:w-1/3">
            <Image
              title={t('features.1.imageTitle')}
              src="/images/save-in-confort.svg"
              className="object-contain"
              fill
              alt=""
            />
          </div>
        </div>

        <HR className="mx-8 my-0 sm:hidden" />
        <div className="flex w-full flex-col-reverse flex-wrap sm:flex-row">
          <div className="relative mt-6 hidden w-full flex-1 p-6 sm:block sm:h-96 sm:w-1/3">
            <Image title={t('features.2.imageTitle')} src="/images/goals.svg" className="object-contain" fill alt="" />
          </div>
          <div className="mt-6 w-full content-center p-6 sm:w-1/2">
            <div className="align-middle">
              <h3 className="mb-3 text-3xl font-bold leading-none text-gray-800 dark:text-stone-100">
                {t('features.2.title')}
              </h3>
              <p className="mb-8 text-gray-600 dark:text-stone-200">{t('features.2.description')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
