import { Table } from '@heroui/react';
import { useTranslations } from 'next-intl';

export const TransactionTableColumnsMobile = () => {
  const t = useTranslations();

  return (
    <Table.Header className="sr-only">
      <Table.Column id="description" isRowHeader>
        {t('Generics.description')}
      </Table.Column>
      <Table.Column id="amount">{t('Generics.amount')}</Table.Column>
      <Table.Column id="actions">{t('Generics.actions')}</Table.Column>
    </Table.Header>
  );
};
