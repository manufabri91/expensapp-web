import Image from 'next/image';

export default function Home() {
  return (
    <div className="mx-auto grid max-w-screen-xl px-4 py-8 lg:grid-cols-12 lg:gap-8 lg:py-16 xl:gap-0">
      <div className="mr-auto place-self-center lg:col-span-7">
        <h1 className="mb-4 max-w-2xl text-4xl font-extrabold leading-none tracking-tight dark:text-white md:text-5xl xl:text-6xl">
          Track Your Expenses <br /> Effortlessly
        </h1>
        <p className="mb-6 max-w-2xl font-light text-gray-500 dark:text-gray-400 md:text-lg lg:mb-8 lg:text-xl">
          Take control of your finances with our easy-to-use expense tracker. Stay organized, analyze your spending, and
          save more.
        </p>
      </div>
      <div className="hidden lg:col-span-5 lg:mt-0 lg:flex">
        <Image src="/images/hero.svg" alt="" width={500} height={500} />
      </div>
    </div>
  );
}
