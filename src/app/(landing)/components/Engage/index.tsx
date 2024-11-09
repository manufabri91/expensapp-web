import Link from 'next/link';

export const Engage = () => {
  return (
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
  );
};
