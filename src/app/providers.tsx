'use client';

import { I18nProvider, RouterProvider, Toast, toast } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import type { ThemeProviderProps } from 'next-themes';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { SWRConfig } from 'swr';

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
  const t = useTranslations('Generics');

  return (
    <I18nProvider locale={locale}>
      <RouterProvider navigate={router.push}>
        <Toast.Provider />
        <NextThemesProvider {...themeProps}>
          <SWRConfig
            value={{
              revalidateOnFocus: false,
              dedupingInterval: 5000,
              onError: () => toast.danger(t('unexpectedError')),
            }}
          >
            {children}
          </SWRConfig>
        </NextThemesProvider>
      </RouterProvider>
    </I18nProvider>
  );
}
