'use client';

import { LinkStyle, LinkType, StyledLink } from '@/components';
import Image from 'next/image';

export default function Error() {
  return (
    <main className="flex h-5/6 flex-col items-center gap-2 p-6">
      <div className="relative flex h-96 w-full">
        <Image className="object-contain" src="/images/oh-no.svg" alt="" fill />
      </div>
      <div className="p-12">
        <h1 className="text-xl uppercase tracking-widest">Whoops! Something wrong happened</h1>
        <p>It&apos;s likely to be our fault, don&apos;t worry</p>
      </div>

      <StyledLink style={LinkStyle.Button} type={LinkType.Primary} href="/">
        Go Back
      </StyledLink>
    </main>
  );
}
