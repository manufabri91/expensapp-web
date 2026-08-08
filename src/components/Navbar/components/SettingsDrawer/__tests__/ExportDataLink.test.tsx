import { render, screen } from '@testing-library/react';
import { ExportDataLink } from '@/components/Navbar/components/SettingsDrawer/ExportDataLink';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('ExportDataLink', () => {
  it('links to the export API route', () => {
    render(<ExportDataLink />);

    const link = screen.getByRole('link', { name: /downloadMyData/ });
    expect(link).toHaveAttribute('href', '/api/privacy/export');
  });
});
