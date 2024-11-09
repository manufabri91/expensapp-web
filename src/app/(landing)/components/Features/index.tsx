import Image from 'next/image';
import { HR } from 'flowbite-react';

export const Features = () => {
  return (
    <section className="bg-stone-100 py-8 dark:bg-slate-950">
      <div className="container m-8 mx-auto max-w-5xl">
        <h2 className="my-2 w-full text-center text-5xl font-bold leading-tight text-gray-800 dark:text-stone-100">
          Top Features
        </h2>
        <div className="mb-4 w-full">
          <div className="mx-auto my-0 h-1 w-64 rounded-t bg-gradient-to-r from-sky-500 to-green-500 py-0 opacity-25"></div>
        </div>
        <div className="flex w-full flex-col flex-wrap sm:flex-row">
          <div className="w-full content-center p-6 sm:w-1/2">
            <h3 className="mb-3 text-3xl font-bold leading-none text-gray-800 dark:text-stone-100">
              Multi-account and categorization
            </h3>
            <p className="mb-8 text-gray-600 dark:text-stone-200">Manage multiple accounts and categories with ease.</p>
          </div>
          <div className="relative mt-6 hidden w-full flex-1 p-6 sm:block sm:h-96 sm:w-1/3">
            <Image title="Save in confort" src="/images/save-in-confort.svg" className="object-contain" fill alt="" />
          </div>
        </div>

        <HR className="mx-8 my-0 sm:hidden" />
        <div className="flex w-full flex-col-reverse flex-wrap sm:flex-row">
          <div className="relative mt-6 hidden w-full flex-1 p-6 sm:block sm:h-96 sm:w-1/3">
            <Image title="Reach your goals" src="/images/goals.svg" className="object-contain" fill alt="" />
          </div>
          <div className="mt-6 w-full content-center p-6 sm:w-1/2">
            <div className="align-middle">
              <h3 className="mb-3 text-3xl font-bold leading-none text-gray-800 dark:text-stone-100">
                Reach your saving goals
              </h3>
              <p className="mb-8 text-gray-600 dark:text-stone-200">
                Configure and track your saving goals. We help you to reach your financial freedom.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
