'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/Button';

// AppProviders (src/lib/providers/index.tsx) renders inside the root layout
// (src/app/layout.tsx), so any error it throws happens *in* the root layout. Next.js's regular
// src/app/error.tsx boundary can't catch that - a route segment's error.tsx is rendered nested
// inside layout.tsx, so it can't recover from a failure in the layout it depends on. Only
// global-error.tsx (which replaces the entire root layout, including <html>/<body>) can. Without
// this file, that class of failure reached users as the framework's raw, unstyled crash page
// instead of the app's own error UI.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error('[global-error] uncaught error reached the root layout:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="text-foreground bg-background min-h-screen font-sans antialiased">
        <main className="flex h-screen flex-col items-center justify-center gap-2 p-6">
          <div className="relative flex h-96 w-full max-w-md">
            <Image className="object-contain" src="/images/oh-no.svg" alt="" fill />
          </div>
          <div className="p-12 text-center">
            <h1 className="text-xl tracking-widest uppercase">Whoops! Something wrong happened</h1>
            <p>It&apos;s likely to be our fault, don&apos;t worry</p>
          </div>

          <Link href="/">
            <Button variant="primary">Go Back</Button>
          </Link>
        </main>
      </body>
    </html>
  );
}
