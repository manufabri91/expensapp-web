import NumberFlow from '@number-flow/react';

interface Props {
  amount: number;
  currency: string;
  warnIfZero?: boolean;
  className?: string;
  locale?: string;
}
const getColor = (amount: number, warnIfZero = false) => {
  if (warnIfZero && amount === 0) {
    return 'text-amber-600 dark:text-amber-300';
  }
  return amount < 0 ? 'text-red-600' : 'text-emerald-600 dark:text-emerald-500';
};

export const Money = ({ amount, currency, locale, warnIfZero, className }: Props) => {
  // TODO: Use clsx to conditionally apply classes
  // TODO: Format the amount with the currency

  return (
    <NumberFlow
      locales={locale}
      className={`${getColor(amount, warnIfZero)} ${className}`}
      value={amount}
      format={{ style: 'currency', currency, trailingZeroDisplay: 'stripIfInteger' }}
    />
  );
};
