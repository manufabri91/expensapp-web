import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/Button';

export default function NotFound() {
  return (
    <main className="flex h-5/6 flex-col items-center gap-2 p-6">
      <div className="relative flex h-96 w-full">
        <Image className="object-contain" src="/images/oh-no.svg" alt="" fill />
      </div>
      <div className="p-12">
        <h1 className="text-xl tracking-widest uppercase">404 | Not Found</h1>
      </div>

      <Button color="primary" as={Link} href="/">
        Go Home
      </Button>
    </main>
  );
}
