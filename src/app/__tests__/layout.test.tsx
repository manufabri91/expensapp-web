import { getLocale } from 'next-intl/server';
import { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import RootLayout from '../layout';

jest.mock('next-intl/server', () => ({ getLocale: jest.fn().mockResolvedValue('en'), getTranslations: jest.fn() }));
jest.mock('next-intl', () => ({ NextIntlClientProvider: ({ children }: { children: ReactNode }) => <>{children}</> }));
jest.mock('@/config/fonts', () => ({ fontBrand: { variable: 'brand' }, fontSans: { variable: 'sans' } }));
jest.mock('@/components', () => ({ Navbar: () => <nav>Navigation and settings</nav> }));
jest.mock('@/components/Footer', () => ({ Footer: () => <footer>Footer</footer> }));
jest.mock('@/components/CookieConsentBanner', () => ({ CookieConsentBanner: () => null }));
jest.mock('@/lib/actions/cookieConsent', () => ({ hasAcknowledgedCookieConsent: jest.fn().mockResolvedValue(true) }));
jest.mock('@/lib/providers', () => ({
  AppProviders: ({ children }: { children: ReactNode }) => <section data-testid="account-context">{children}</section>,
}));
jest.mock('../providers', () => ({ Providers: ({ children }: { children: ReactNode }) => <>{children}</> }));

describe('root account context', () => {
  it('provides the same account preferences to navigation settings and the page', async () => {
    const layout = await RootLayout({ children: <article>Transactions</article> });
    const markup = renderToStaticMarkup(layout);
    const document = new DOMParser().parseFromString(markup, 'text/html');
    const context = document.querySelector('[data-testid="account-context"]');
    expect(context?.querySelector('nav')?.textContent).toBe('Navigation and settings');
    expect(context?.querySelector('article')?.textContent).toBe('Transactions');
    expect(getLocale).toHaveBeenCalled();
  });
});
