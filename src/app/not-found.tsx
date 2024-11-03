import { LinkStyle, LinkType, StyledLink } from "@/components";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center h-5/6 gap-2 p-6">
      <div className="flex h-96 w-full relative">
        <Image className="object-contain" src="/images/oh-no.svg" alt="" fill />
      </div>
      <div className="p-12">
        <h1 className="text-xl uppercase tracking-widest">404 | Not Found</h1>
      </div>

      <StyledLink style={LinkStyle.Button} type={LinkType.Secondary} href="/">
        Go Home
      </StyledLink>
    </main>
  );
}
