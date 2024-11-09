import { WavesBottom, WavesTop } from '@/components';
import { HR } from 'flowbite-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <section className="flex-1 bg-gradient-to-r from-sky-500 to-green-500 dark:from-slate-800 dark:from-15% dark:via-sky-700 dark:to-green-700">
      <div className="pt-24">
        <div className="container mx-auto flex flex-col flex-wrap items-center px-3 md:flex-row">
          <div className="flex w-full flex-col items-start justify-center text-center sm:items-center md:w-2/5 md:text-left">
            <p className="w-full uppercase -tracking-wide">Want to organize your expenses?</p>
            <h1 className="my-4 w-full text-5xl font-bold leading-tight">We have your back</h1>
            <p className="mb-8 text-2xl leading-normal">
              e-XpensApp is a simple and intuitive expense tracking app that helps you to manage your expenses and
              finances
            </p>
            <Link
              href="/auth/register"
              className="mx-auto my-6 rounded-full bg-white px-8 py-4 font-bold text-gray-800 shadow-lg transition duration-300 ease-in-out hover:scale-105 hover:underline focus:outline-none lg:mx-0"
            >
              Register
            </Link>
          </div>
          <div className="w-full py-6 text-center md:w-3/5">
            <Image className="z-50 w-full md:w-4/5" src="/images/hero.svg" alt="" height={500} width={500} />
          </div>
        </div>
      </div>
      <div className="relative -mt-12 lg:-mt-24">
        <WavesTop />
      </div>
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
              <p className="mb-8 text-gray-600 dark:text-stone-200">
                Manage multiple accounts and categories with ease.
              </p>
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
      <WavesBottom />
      <section className="container mx-auto mb-12 py-6 text-center">
        <h2 className="my-6 w-full text-center text-5xl font-bold leading-tight">Start saving now</h2>
        <div className="mb-6 w-full">
          <div className="mx-auto my-0 h-1 w-1/6 rounded-t bg-white py-0 opacity-25"></div>
        </div>
        <h3 className="mb-12 text-3xl leading-tight">And reach your financial freedom!</h3>
        <Link
          href="/auth/register"
          className="mx-auto my-6 rounded-full bg-white px-8 py-4 font-bold text-gray-800 shadow-lg transition duration-300 ease-in-out hover:scale-105 hover:underline focus:outline-none lg:mx-0"
        >
          Register
        </Link>
      </section>
    </section>
  );
}
