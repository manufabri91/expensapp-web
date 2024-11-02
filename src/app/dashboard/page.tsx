import { Card, Money } from "@/components";

const Dashboard = () => {
  return (
    <div className="bg-gray-100 dark:bg-slate-950 min-h-screen">
      <main className="p-6">
        <h2 className="text-gray-800 dark:text-gray-100 text-2xl font-semibold">
          Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
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
    </div>
  );
};

export default Dashboard;
