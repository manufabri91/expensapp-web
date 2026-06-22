'use client';

import { I18nProvider, RouterProvider, Toast } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import type { ThemeProviderProps } from 'next-themes';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module '@react-types/shared' {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>['push']>[1]>;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const locale = useLocale();

  return (
    <I18nProvider locale={locale}>
      <RouterProvider navigate={router.push}>
        <Toast.Provider />
        <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </RouterProvider>
    </I18nProvider>
  );
}
