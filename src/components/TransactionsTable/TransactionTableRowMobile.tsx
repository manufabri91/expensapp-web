import { Avatar, AvatarFallback, Table, Tooltip } from '@heroui/react';
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

export const TransactionTableRowMobile = ({ transaction, isEditing, isDeleting, onEdit, onDelete }: Props) => {
  const t = useTranslations();
  const format = useFormatter();
  const locale = useLocale();
  const trySystemTranslations = useTrySystemTranslations();

  return (
    <Table.Row id={transaction.id}>
      <Table.Cell>
        <span className="flex items-center gap-2 truncate">
          <Avatar color="accent" variant="soft">
            <Avatar.Fallback className="from-brand-green-300/20 to-brand-purple-800/40 bg-linear-to-br">
              {AVAILABLE_ICONS.has(transaction.category.iconName) &&
                React.createElement(AVAILABLE_ICONS.get(transaction.category.iconName)!, {
                  color: transaction.category.color ?? undefined,
                  className: 'size-5',
                })}
            </Avatar.Fallback>
          </Avatar>

          <div className="flex flex-col gap-1">
            <span>{trySystemTranslations(transaction.description)}</span>
            <span className="text-muted text-sm">
              {format.dateTime(parseISO(transaction.eventDate), {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
              })}
            </span>
            <span className="text-muted truncate">
              {trySystemTranslations(transaction.category.name)} &middot;{' '}
              {trySystemTranslations(transaction.subcategory.name)}
            </span>
          </div>
        </span>
      </Table.Cell>

      <Table.Cell>
        <div></div>
        <Money
          amount={transaction.amount}
          currency={transaction.currencyCode}
          locale={locale}
          className="font-semibold"
        />

        <span className="text-muted">{transaction.accountName}</span>
      </Table.Cell>

      <Table.Cell>
        <div className="flex justify-end gap-1">
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
        </div>
      </Table.Cell>
    </Table.Row>
  );
};
