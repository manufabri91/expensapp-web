import NumberFlow from '@number-flow/react';

interface Props {
  amount: number;
  currency: string;
  warnIfZero?: boolean;
  className?: string;
}
const getColor = (amount: number, warnIfZero = false) => {
  if (warnIfZero && amount === 0) {
    return 'text-amber-600 dark:text-amber-300';
  }
  return amount < 0 ? 'text-red-600' : 'text-green-600';
};

export const Money = ({ amount, currency, warnIfZero, className }: Props) => {
  // TODO: Use clsx to conditionally apply classes
  // TODO: Format the amount with the currency

  return (
    <NumberFlow
      className={`${getColor(amount, warnIfZero)} ${className}`}
      value={amount}
      format={{ style: 'currency', currency, trailingZeroDisplay: 'stripIfInteger' }}
    />
  );
};
