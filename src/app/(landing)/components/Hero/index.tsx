import Image from 'next/image';
import Link from 'next/link';

export const Hero = () => {
  return (
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
  );
};
