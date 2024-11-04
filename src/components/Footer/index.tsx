import { StyledLink } from '@/components/StyledLink';

export const Footer = () => {
  return (
    <footer className="bg-stone-50 p-4 text-center dark:bg-slate-900">
      <StyledLink href="https://www.manuelfabri.com" rel="noopener noreferrer" target="_blank">
        ManukoDEV
      </StyledLink>
      <p>2024 - All rights reserved.</p>
    </footer>
  );
};
