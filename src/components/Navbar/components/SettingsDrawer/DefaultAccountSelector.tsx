import { useTranslations } from 'next-intl';
import { Button } from '@/components/Button';
import { AccountSelect } from '@/components/TransactionForm/components/AccountSelect';
import { useAccountPreferences } from '@/lib/providers/AccountPreferencesProvider';
import { useAccounts } from '@/lib/providers/AccountsProvider';

export const DefaultAccountSelector = () => {
  const t = useTranslations('AmountFlow');
  const { accounts } = useAccounts();
  const preferences = useAccountPreferences();
  return (
    <div className="flex flex-col gap-2">
      <AccountSelect
        label={t('defaultAccount')}
        accounts={accounts}
        selection={{ required: false, value: preferences.defaultAccountId, onChange: preferences.setDefault }}
      />
      <p className="text-muted text-sm" role="status">
        {t(preferences.persistent ? 'browserPreference' : 'storageUnavailable')}
      </p>
      <Button type="button" variant="ghost" className="self-start" onPress={() => preferences.setDefault(undefined)}>
        {t('noDefault')}
      </Button>
    </div>
  );
};
