import { Card, Money } from '@/components';
import { getAccounts } from '@/lib/actions/accounts';

export const AccountsDetails = async () => {
  const accounts = await getAccounts();
  return (
    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <Card key={account.id} title={account.name}>
          <Money amount={account.accountBalance} currency={account.currency} className="text-2xl" />
        </Card>
      ))}
    </div>
  );
};
