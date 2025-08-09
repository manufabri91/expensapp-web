export type Locale = (typeof locales)[number];

export const locales = ['en', 'es', 'es-AR'] as const;
export const defaultLocale: Locale = 'en';
