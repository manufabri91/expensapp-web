import { Card, Money } from '@/components';

const Dashboard = () => {
  return (
    <main className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Dashboard</h2>
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card title="Account Balance">
          <Money amount={10000} currency="$" />
        </Card>
        <Card title="Expenses">
          <Money amount={-5000} currency="$" />
        </Card>
        <Card title="Investments">
          <Money amount={10000} currency="$" />
        </Card>
      </div>
    </main>
  );
};

export default Dashboard;
