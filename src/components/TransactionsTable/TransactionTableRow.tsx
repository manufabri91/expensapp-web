import { Table, Tooltip } from '@heroui/react';
import { parseISO } from 'date-fns';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import React from 'react';
import { HiPencil, HiTrash } from 'react-icons/hi2';
import { Button } from '@/components/Button';
import { AVAILABLE_ICONS } from '@/components/IconPicker/constants';
import { Money } from '@/components/Money';
import { useTrySystemTranslations } from '@/hooks/useTrySystemTranslations';
import { TransactionResponse } from '@/types/dto';

interface Props {
  transaction: TransactionResponse;
  isEditing: boolean;
  isDeleting: boolean;
  onEdit: (tx: TransactionResponse) => void;
  onDelete: (tx: TransactionResponse) => void;
}

export const TransactionTableRow = ({ transaction, isEditing, isDeleting, onEdit, onDelete }: Props) => {
  const t = useTranslations();
  const format = useFormatter();
  const locale = useLocale();
  const trySystemTranslations = useTrySystemTranslations();

  return (
    <Table.Row id={transaction.id}>
      <Table.Cell>
        <span className="flex items-center gap-2">
          {AVAILABLE_ICONS.has(transaction.category.iconName) &&
            React.createElement(AVAILABLE_ICONS.get(transaction.category.iconName)!, {
              color: transaction.category.color ?? undefined,
              className: 'size-6 mr-1',
            })}
          {trySystemTranslations(transaction.description)}
        </span>
      </Table.Cell>

      <Table.Cell>{transaction.accountName}</Table.Cell>

      <Table.Cell>{trySystemTranslations(transaction.category.name)}</Table.Cell>

      <Table.Cell>{trySystemTranslations(transaction.subcategory.name)}</Table.Cell>

      <Table.Cell>
        {format.dateTime(parseISO(transaction.eventDate), {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
        })}
      </Table.Cell>

      <Table.Cell className="text-right font-semibold">
        <Money amount={transaction.amount} currency={transaction.currencyCode} locale={locale} />
      </Table.Cell>

      <Table.Cell className="flex justify-end gap-1 md:gap-2">
        <Tooltip>
          <Tooltip.Trigger>
            <Button
              isDisabled={isEditing}
              isIconOnly
              aria-label={isEditing ? t('Generics.editing') : t('Generics.edit')}
              onPress={() => onEdit(transaction)}
              variant="ghost"
            >
              <HiPencil />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>{isEditing ? t('Generics.editing') : t('Generics.edit')}</Tooltip.Content>
        </Tooltip>
        <Tooltip>
          <Tooltip.Trigger>
            <Button
              isIconOnly
              isDisabled={isDeleting}
              aria-label={isDeleting ? t('Generics.deleting') : t('Generics.delete')}
              onPress={() => onDelete(transaction)}
              variant="danger"
            >
              <HiTrash />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>{isDeleting ? t('Generics.deleting') : t('Generics.delete')}</Tooltip.Content>
        </Tooltip>
      </Table.Cell>
    </Table.Row>
  );
};
