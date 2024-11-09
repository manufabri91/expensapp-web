import { RegisterButton } from '@/components/RegisterButton';
import Image from 'next/image';

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
