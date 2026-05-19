/* eslint-disable @typescript-eslint/no-explicit-any */

export default function MoneySummaryCards({ data }: any) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <Card title="Income" value={data.income} />
      <Card title="Expense" value={data.expense} />
      <Card title="Loan" value={data.loan} />
      <Card title="Balance" value={data.balance} />
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-xl font-bold">₹{value}</h2>
    </div>
  );
}
