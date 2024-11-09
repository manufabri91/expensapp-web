'use client';

import { StyledLink } from '@/components';

export const AuthorizedLinks = () => {
  return (
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
  );
};
