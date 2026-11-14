import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { TransactionModeSelector } from '@/components/TransactionModeSelector';
import { TransactionTypeSelector } from '@/components/TransactionTypeSelector';
import { TransactionType } from '@/types/enums/transactionType';
import { AccountSelect } from './AccountSelect';
import { AmountEntry } from './AmountEntry';
import { AmountKeypad } from './AmountKeypad';
import { TransactionDraft } from '../useTransactionDraft';

export const TransactionAmountStep = ({ draft }: { draft: TransactionDraft }) => {
  const t = useTranslations();
  const locale = useLocale();
  const decimal =
    new Intl.NumberFormat(locale).formatToParts(1.1).find((part) => part.type === 'decimal')?.value ?? '.';
  return (
    <div
      className="flex flex-col gap-4"
      onKeyDown={(event) => {
        if (event.target instanceof HTMLInputElement || event.ctrlKey || event.metaKey || event.altKey) return;
        const key = event.key === decimal ? '.' : event.key;
        if (/^[\d.+*/=-]$/.test(key) || key === 'Backspace' || key === 'Delete') {
          event.preventDefault();
          draft.calculator.press(key);
        }
      }}
    >
      {!draft.isEditing && <TransactionModeSelector initialValue={draft.mode} onSelect={draft.changeMode} />}
      <TransactionTypeSelector
        initialValue={draft.type}
        onSelect={draft.changeType}
        hideTransfers={draft.mode === 'recurring'}
      />
      <AmountEntry
        calculator={draft.calculator}
        currency={draft.selectedAccount?.currency}
        onContinue={draft.continueToDetails}
      />
      <AccountSelect
        label={t('Generics.account')}
        accounts={draft.accounts}
        selection={{
          value: draft.selectedAccount?.id,
          defaultAccountId: draft.preferences.defaultAccountId,
          onChange: draft.changeAccount,
        }}
      />
      {!draft.selectedAccount && <p className="text-muted text-sm">{t('AmountFlow.accountRequired')}</p>}
      {draft.type === TransactionType.TRANSFER && (
        <>
          <AccountSelect
            label={t('TransactionForm.destinationAccount')}
            accounts={draft.accounts.filter(
              (account) =>
                account.id !== draft.selectedAccount?.id && account.currency === draft.selectedAccount?.currency
            )}
            selection={{
              value: draft.destination?.id,
              onChange: (value) => draft.form.setValue('destinationAccount', value, { shouldDirty: true }),
            }}
          />
          {!draft.destination && <p className="text-muted text-sm">{t('AmountFlow.destinationRequired')}</p>}
        </>
      )}
      {draft.accounts.length === 0 && (
        <Link href="/manage" className="text-link underline">
          {t('AmountFlow.manageAccounts')}
        </Link>
      )}
      {draft.currencyNotice && (
        <p className="text-muted text-sm" role="status">
          {t('AmountFlow.currencyChanged', { currency: draft.currencyNotice })}
        </p>
      )}
      <AmountKeypad decimal={decimal} onPress={draft.calculator.press} />
    </div>
  );
};
