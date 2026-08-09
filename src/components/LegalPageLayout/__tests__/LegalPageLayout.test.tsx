import { render, screen } from '@testing-library/react';
import { LegalPageLayout } from '@/components/LegalPageLayout';

describe('LegalPageLayout', () => {
  it('renders the title, last-updated date, disclaimer and every section', () => {
    render(
      <LegalPageLayout
        title="Privacy Policy"
        lastUpdated="Last updated: August 8, 2026"
        disclaimer="This is a template, not legal advice."
        sections={[
          { heading: '1. Who we are', body: 'We are e-Xpens.' },
          { heading: '2. Contact', body: 'Email us.' },
        ]}
      />
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByText('Last updated: August 8, 2026')).toBeInTheDocument();
    expect(screen.getByText('This is a template, not legal advice.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '1. Who we are' })).toBeInTheDocument();
    expect(screen.getByText('We are e-Xpens.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '2. Contact' })).toBeInTheDocument();
    expect(screen.getByText('Email us.')).toBeInTheDocument();
  });
});
