import { StyledLink } from '@/components/StyledLink';

export const Footer = () => {
  return (
    <footer className="flex flex-col items-center justify-center p-4 text-center">
      <StyledLink href="https://www.manuelfabri.com" rel="noopener noreferrer" target="_blank">
        ManukoDEV
      </StyledLink>
      <p>{new Date().getFullYear()} - All rights reserved</p>
    </footer>
  );
};
