
import { Button } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <section className="relative h-full bg-white dark:bg-gray-900">
    <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
        <div className="mr-auto place-self-center lg:col-span-7">
            <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white">Track Your Expenses <br /> Effortlessly</h1>
            <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">
            Take control of your finances with our easy-to-use expense tracker. 
            Stay organized, analyze your spending, and save more.</p>
            <Button pill color="primary">Get Started</Button>
        </div>
        <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
            <Image src="/images/hero.svg" alt="" width={500} height={500}/>
        </div>                
    </div>
  </section>
   
  );
}
