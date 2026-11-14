import { Label, ListBox, Select } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { AccountResponse } from '@/types/dto';

interface Props {
  label: string;
  accounts: AccountResponse[];
  selection: { value?: number; required?: boolean; defaultAccountId?: number; onChange: (value?: number) => void };
}
export const AccountSelect = ({ label, accounts, selection }: Props) => {
  const t = useTranslations('AmountFlow');
  return (
    <Select
      isRequired={selection.required ?? true}
      variant="secondary"
      selectedKey={selection.value?.toString() ?? null}
      onSelectionChange={(key) => selection.onChange(key ? Number(key) : undefined)}
      placeholder={t('chooseAccount')}
    >
      <Label>{label}</Label>
      <Select.Trigger
        className="min-h-11"
        style={{ background: 'var(--field-background)', color: 'var(--field-foreground)' }}
      >
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {accounts.map((account) => (
            <ListBox.Item key={account.id} id={String(account.id)} textValue={`${account.name} · ${account.currency}`}>
              <span className="flex w-full flex-wrap items-center gap-2">
                <span>
                  {account.name} · {account.currency}
                </span>
                {account.id === selection.defaultAccountId && (
                  <span className="text-muted text-xs">{t('defaultBadge')}</span>
                )}
              </span>
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
};
