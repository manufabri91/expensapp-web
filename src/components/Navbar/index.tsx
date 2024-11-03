"use client";

import { Button, ButtonType, MenuButton, StyledLink } from "@/components";
import Image from "next/image";
import Link from "next/link";

export const Navbar = () => {
  return (
    <header className="bg-stone-50 dark:bg-slate-900">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="e-Xpensapp"
            width={50}
            height={50}
          />
        </Link>

        <div className="flex flex-1 items-center justify-end md:justify-between">
          <nav aria-label="Global" className="hidden md:block">
            <ul className="flex items-center gap-6 text-sm">
              <li>
                <StyledLink href="/dashboard">Dashboard</StyledLink>
              </li>
              <li>
                <StyledLink href="/transactions">Transactions</StyledLink>
              </li>
              <li>
                <StyledLink href="/accounts">Accounts</StyledLink>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <div className="sm:gap-4 hidden md:flex">
              <Button
                type={ButtonType.Secondary}
                label="Register"
                onClick={() => {
                  console.log("Register");
                }}
              />
              <Button
                type={ButtonType.Primary}
                label="Login"
                onClick={() => {
                  console.log("Register");
                }}
              />
            </div>

            <MenuButton ariaLabel="Toggle Menu" className="md:hidden" />
          </div>
        </div>
      </div>
    </header>
  );
};
