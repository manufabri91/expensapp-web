'use client';

import { HeroUIProvider } from '@heroui/system';
import { ToastProvider } from '@heroui/toast';
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
    <HeroUIProvider navigate={router.push} locale={locale}>
      <ToastProvider />
      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
    </HeroUIProvider>
  );
}
