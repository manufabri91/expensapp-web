interface Props {
  amount: number;
  currency: string;
}

export const Money = ({ amount, currency }: Props) => {
  // TODO: Use clsx to conditionally apply classes
  const color = amount < 0 ? 'text-red-600' : 'text-green-600';
  // TODO: Format the amount with the currency
  return <p className={`text-2xl ${color}`}>{`${currency}${amount}`}</p>;
};
