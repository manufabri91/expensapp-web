import NumberFlow from '@number-flow/react';

interface Props {
  amount: number;
  currency: string;
  className?: string;
}
const getColor = (amount: number) => (amount < 0 ? 'text-red-600' : 'text-green-600');

export const Money = ({ amount, currency, className }: Props) => {
  // TODO: Use clsx to conditionally apply classes
  // TODO: Format the amount with the currency

  return (
    <NumberFlow
      className={`${getColor(amount)} ${className}`}
      value={amount}
      format={{ style: 'currency', currency, trailingZeroDisplay: 'stripIfInteger' }}
    />
  );
};
