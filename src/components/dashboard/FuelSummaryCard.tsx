/* eslint-disable @typescript-eslint/no-explicit-any */
export default function FuelSummaryCards({ data }: any) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <Card title="Fuel Cost" value={data.totalCost} />
      <Card title="Litres" value={data.totalLitres} />
      <Card title="Avg Mileage" value={data.avgMileage.toFixed(2)} />
      <Card title="Cost/KM" value={data.costPerKm.toFixed(2)} />
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  );
}
