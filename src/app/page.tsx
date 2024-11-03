import { LinkStyle, LinkType, StyledLink } from "@/components";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    // <div className="h-full">
    //   <div></div>
    //   <h1 className="text-4xl font-bold mb-4">Take Control of Your Finances</h1>
    //   <p className="text-lg mb-6 max-w-md">
    //     Our expense tracker helps you manage your spending, stay within budget,
    //     and achieve your financial goals effortlessly.
    //   </p>
    //   <Image src="/images/hero.svg" alt="Hero" fill/>
    // </div>
    <section className="relative h-full bg-gradient-to-b from-teal-300 to-blue-900 text-white py-16 lg:py-24">
      <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center px-6 lg:px-12">
        
        {/* Left Column */}
        <div className="flex flex-col items-start text-center lg:text-left lg:w-1/2 lg:mr-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Track Your Expenses <br /> Effortlessly
          </h1>
          <p className="text-lg lg:text-xl mb-6">
            Take control of your finances with our easy-to-use expense tracker. 
            Stay organized, analyze your spending, and save more.
          </p>
          <div className="flex flex-col lg:flex-row gap-4">
            <Link href="/signup">
              <span className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-blue-100">
                Get Started
              </span>
            </Link>
            <Link href="/learn-more">
              <span className="px-8 py-3 border-2 border-white font-semibold rounded-lg hover:bg-white hover:text-blue-600">
                Learn More
              </span>
            </Link>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex justify-center lg:justify-end lg:w-1/2 mb-8 lg:mb-0">
          <Image 
            src="/images/hero.svg" 
            alt="Expense Tracker Illustration" 
            width={500} 
            height={500}
          />
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-white opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-400 opacity-25 rounded-full blur-3xl"></div>
    </section>
  );
}
