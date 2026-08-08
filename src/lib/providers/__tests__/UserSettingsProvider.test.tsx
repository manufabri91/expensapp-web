import { render, screen } from '@testing-library/react';
import { useTheme } from 'next-themes';
import { UserSettingsProvider } from '@/lib/providers/UserSettingsProvider';

jest.mock('next-themes', () => ({ useTheme: jest.fn() }));

const mockedUseTheme = useTheme as unknown as jest.Mock;

describe('UserSettingsProvider', () => {
  it('renders its children', () => {
    const setTheme = jest.fn();
    mockedUseTheme.mockReturnValue({ theme: 'system', setTheme });

    render(
      <UserSettingsProvider initialSettings={{ theme: 'system', locale: 'en' }}>
        <span>child content</span>
      </UserSettingsProvider>
    );

    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('applies the account theme when it differs from the current local theme', () => {
    const setTheme = jest.fn();
    mockedUseTheme.mockReturnValue({ theme: 'light', setTheme });

    render(
      <UserSettingsProvider initialSettings={{ theme: 'dark', locale: 'en' }}>
        <span>child content</span>
      </UserSettingsProvider>
    );

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('does not change the theme when it already matches the account theme', () => {
    const setTheme = jest.fn();
    mockedUseTheme.mockReturnValue({ theme: 'dark', setTheme });

    render(
      <UserSettingsProvider initialSettings={{ theme: 'dark', locale: 'en' }}>
        <span>child content</span>
      </UserSettingsProvider>
    );

    expect(setTheme).not.toHaveBeenCalled();
  });
});
