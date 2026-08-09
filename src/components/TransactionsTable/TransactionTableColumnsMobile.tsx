import { Table } from '@heroui/react';
import { useTranslations } from 'next-intl';

export const TransactionTableColumnsMobile = () => {
  const t = useTranslations();

  return (
    <Table.Header>
      <Table.Column id="description" isRowHeader>
        <div className="sr-only">
          <span>{t('Generics.description')}</span>
          <span>{t('Generics.date')}</span>
          <span>{t('Generics.category')}</span>
        </div>
      </Table.Column>
      <Table.Column id="amount">
        <div className="sr-only">
          <span>{t('Generics.amount')}</span>
          <span>{t('Generics.account')}</span>
        </div>
      </Table.Column>
    </Table.Header>
  );
};
