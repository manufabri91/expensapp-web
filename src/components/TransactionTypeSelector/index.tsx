'use client';
import { ButtonSelector } from '@/components/ButtonSelector';
import { TransactionType } from '@/types/enums/transactionType';
import { useTranslations } from 'next-intl';

interface Props {
  initialValue?: TransactionType;
  onSelect: (type: TransactionType) => void;
  hideTransfers?: boolean;
}

export const TransactionTypeSelector = ({ initialValue, onSelect, hideTransfers = false }: Props) => {
  const t = useTranslations('Generics');
  const options = [
    { id: TransactionType.INCOME, label: t('income.singular'), colorClass: 'before:bg-green-500' },
    { id: TransactionType.EXPENSE, label: t('expense.singular'), colorClass: 'before:bg-red-500' },
    { id: TransactionType.TRANSFER, label: t('transfer.singular'), colorClass: 'before:bg-blue-500' },
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
