import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Footer';

// Footer is an async Server Component (`getTranslations` from 'next-intl/server' requires request
// context this test doesn't have), so it can't be passed to RTL's `render()` directly - call and
// await it like a plain async function first, then render the resolved element (same pattern as
// `src/lib/providers/__tests__/index.test.tsx` uses for AppProviders).
jest.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => {
    const translations: Record<string, string> = {
      rights: 'All rights reserved',
      'links.privacyPolicy': 'Privacy Policy',
      'links.termsOfUse': 'Terms of Use',
      'links.cookiePolicy': 'Cookie Policy',
    };
    return translations[key] ?? key;
  },
}));

describe('Footer component', () => {
  it('should render correctly', async () => {
    const { container } = render(await Footer());

    expect(container).toMatchSnapshot();
  });

  it('should render the company name as a link to manuelfabri.com', async () => {
    render(await Footer());

    const companyLink = screen.getByRole('link', { name: 'ManukoDEV' });
    expect(companyLink).toHaveAttribute('href', 'https://www.manuelfabri.com');
  });

  it('should render the current year and the rights-reserved text', async () => {
    render(await Footer());

    expect(screen.getByText(`${new Date().getFullYear()} - All rights reserved`)).toBeInTheDocument();
  });

  it('should link to the privacy policy, terms of use and cookie policy pages', async () => {
    render(await Footer());

    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/legal/privacy-policy');
    expect(screen.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute('href', '/legal/terms-of-use');
    expect(screen.getByRole('link', { name: 'Cookie Policy' })).toHaveAttribute('href', '/legal/cookie-policy');
  });
});
