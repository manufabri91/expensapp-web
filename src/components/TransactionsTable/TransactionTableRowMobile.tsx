import { Popover, Table, Tooltip } from '@heroui/react';
import { parseISO } from 'date-fns';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { HiPencil, HiTrash } from 'react-icons/hi2';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
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
  const [showPopover, setShowPopover] = useState(false);

  const handleEditClick = () => {
    onEdit(transaction);
    setShowPopover(false);
  };

  const handleDeleteClick = () => {
    onDelete(transaction);
    setShowPopover(false);
  };

  return (
    <Table.Row id={transaction.id} className="w-full">
      <Table.Cell>
        <span className="flex items-center gap-2 truncate">
          <Icon
            iconName={transaction.category.iconName}
            color={transaction.category.color ?? undefined}
            className="size-8"
          />

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
        <Popover isOpen={showPopover} onOpenChange={setShowPopover}>
          <Popover.Trigger>
            <Money
              amount={transaction.amount}
              currency={transaction.currencyCode}
              locale={locale}
              className="font-semibold"
            />

            <span className="text-muted">{transaction.accountName}</span>
          </Popover.Trigger>
          <Popover.Content>
            <div className="flex justify-end gap-1">
              <Tooltip>
                <Tooltip.Trigger>
                  <Button
                    isDisabled={isEditing}
                    isIconOnly
                    aria-label={isEditing ? t('Generics.editing') : t('Generics.edit')}
                    onPress={handleEditClick}
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
                    onPress={handleDeleteClick}
                    variant="danger"
                  >
                    <HiTrash />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>{isDeleting ? t('Generics.deleting') : t('Generics.delete')}</Tooltip.Content>
              </Tooltip>
            </div>
          </Popover.Content>
        </Popover>
      </Table.Cell>
    </Table.Row>
  );
};
