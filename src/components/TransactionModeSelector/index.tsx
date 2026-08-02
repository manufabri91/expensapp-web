'use client';
import { useTranslations } from 'next-intl';
import { ButtonSelector } from '@/components/ButtonSelector';

export type TransactionMode = 'oneTime' | 'recurring';

interface Props {
  initialValue?: TransactionMode;
  onSelect: (mode: TransactionMode) => void;
}

export const TransactionModeSelector = ({ initialValue, onSelect }: Props) => {
  const t = useTranslations('TransactionForm.mode');
  const options = [
    { id: 'oneTime', label: t('oneTime'), colorClass: 'before:bg-slate-500' },
    { id: 'recurring', label: t('recurring'), colorClass: 'before:bg-purple-500' },
  ];

  return (
    <ButtonSelector
      options={options}
      onChange={(id: string) => onSelect(id as TransactionMode)}
      value={initialValue}
      fieldName="mode"
    />
  );
};
