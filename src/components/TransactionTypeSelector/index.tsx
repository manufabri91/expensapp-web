import { ButtonSelector } from '@/components/ButtonSelector';
import { TransactionType } from '@/types/enums/transactionType';

interface Props {
  initialValue?: TransactionType;
  onSelect: (type: TransactionType) => void;
  hideTransfers?: boolean;
}

export const TransactionTypeSelector = ({ initialValue, onSelect, hideTransfers = false }: Props) => {
  const options = [
    { id: TransactionType.INCOME, label: 'Income', colorClass: 'before:bg-green-500' },
    { id: TransactionType.EXPENSE, label: 'Expense', colorClass: 'before:bg-red-500' },
    { id: TransactionType.TRANSFER, label: 'Transfer', colorClass: 'before:bg-blue-500' },
  ];

  if (hideTransfers) {
    options.pop();
  }

  return (
    <ButtonSelector
      options={options}
      onChange={(id: string) => onSelect(id as TransactionType)}
      value={initialValue}
      fieldName="type"
    />
  );
};
