import { render, screen } from '@testing-library/react';
import PrivacyPolicyPage from '@/app/(legal)/legal/privacy-policy/page';

const messages: Record<string, string> = {
  title: 'Privacy Policy',
  lastUpdated: 'Last updated: August 8, 2026',
  disclaimer: 'This is a template, not legal advice.',
};
const sections = [{ heading: '1. Who we are', body: 'We are e-Xpens.' }];

jest.mock('next-intl/server', () => ({
  getTranslations: async () => {
    const translate = (key: string) => messages[key] ?? key;
    translate.raw = (key: string) => (key === 'sections' ? sections : key);
    return translate;
  },
}));

describe('PrivacyPolicyPage', () => {
  it('renders the translated title and every section', async () => {
    render(await PrivacyPolicyPage());

    expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByText('This is a template, not legal advice.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '1. Who we are' })).toBeInTheDocument();
  });
});
