import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center h-5/6 gap-2 p-6">
      <div className="flex h-96 w-full relative">
        <Image className="object-contain" src="/images/oh-no.svg" alt="" fill />
      </div>
      <div className="p-12">
        <h1 className="text-xl uppercase tracking-widest">404 | Not Found</h1>
      </div>

      <Link
        href="/"
        className="px-4 py-2 rounded-full border-2 transition ease-in-out bg-blue-600 text-stone-100 hover:bg-blue-900 hover:text-stone-300 hover:border-stone-300 dark:bg-emerald-800 dark:border-stone-300 dark:text-stone-300 dark:hover:bg-teal-950"
      >
        Go Home
      </Link>
    </main>
  );
}
