'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/Button';

export default function Error({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error('[error boundary]', error);
  }, [error]);

  return (
    <main className="flex h-5/6 flex-col items-center gap-2 p-6">
      <div className="relative flex h-96 w-full">
        <Image className="object-contain" src="/images/oh-no.svg" alt="" fill />
      </div>
      <div className="p-12">
        <h1 className="text-xl tracking-widest uppercase">Whoops! Something wrong happened</h1>
        <p>It&apos;s likely to be our fault, don&apos;t worry</p>
      </div>

      <Link href="/">
        <Button variant="primary">Go Back</Button>
      </Link>
    </main>
  );
}
