import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full">
      <h1 className="text-4xl font-bold mb-4">Take Control of Your Finances</h1>
      <Image src="/images/hero.svg" width={400} height={400} alt="Hero" />
      <p className="text-lg mb-6 max-w-md">
        Our expense tracker helps you manage your spending, stay within budget,
        and achieve your financial goals effortlessly.
      </p>
    </div>
  );
}
