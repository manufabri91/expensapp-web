export const getCurrencySymbol = (locale: Intl.LocalesArgument | string, currency: string) =>
  currency &&
  (0)
    .toLocaleString(locale, { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 })
    .replace(/\d/g, '')
    .trim();
