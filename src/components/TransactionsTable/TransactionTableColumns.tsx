import { Table } from '@heroui/react';
import { useTranslations } from 'next-intl';

export const TransactionTableColumns = () => {
  const t = useTranslations();

  return (
    <Table.Header className="bg-surface-secondary sticky top-0 z-10">
      <Table.Column id="description" isRowHeader>
        {t('Generics.description')}
      </Table.Column>
      <Table.Column id="account">{t('Generics.account')}</Table.Column>
      <Table.Column id="category">{t('Generics.category')}</Table.Column>
      <Table.Column id="subcategory">{t('Generics.subcategory')}</Table.Column>
      <Table.Column id="date">{t('Generics.date')}</Table.Column>
      <Table.Column id="amount" className="text-end">
        {t('Generics.amount')}
      </Table.Column>
      <Table.Column id="actions" className="pr-7 text-end">
        {t('Generics.actions')}
      </Table.Column>
    </Table.Header>
  );
};
