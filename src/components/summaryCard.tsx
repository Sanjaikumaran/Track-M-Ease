import { Loader, type LucideIcon } from "lucide-react";

export type SummaryCardConfig = {
  label: string;
  key: string;
  cardIcon: LucideIcon;
  color:
    | "green"
    | "red"
    | "orange"
    | "blue"
    | "indigo"
    | "purple"
    | "pink"
    | "emerald";
  formatter?: (value: string | number) => string;
};

type SummaryCardsGridProps<T extends object> = {
  config: SummaryCardConfig[];
  data: T;
  loading?: boolean;
  cols?: number;
};

function SummaryCardsGrid<T extends Record<string, string | number>>({
  config,
  data,
  loading = false,
  cols = 2,
}: SummaryCardsGridProps<T>) {
  return (
    <div
      className={`grid w-full grid-cols-1 gap-4 sm:grid-cols-${cols} 2xl:grid-cols-${cols}`}
    >
      {config.map((item) => {
        const rawValue = data[item.key];

        const value = item.formatter
          ? item.formatter(rawValue)
          : String(rawValue ?? "-");

        return (
          <SummaryCard
            key={item.key}
            title={item.label}
            value={value}
            loading={loading}
            color={item.color}
            icon={item.cardIcon}
          />
        );
      })}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
  loading = false,
}: {
  title: string;
  value: string;
  icon: LucideIcon;
  color:
    | "green"
    | "red"
    | "orange"
    | "blue"
    | "indigo"
    | "purple"
    | "pink"
    | "emerald";
  loading?: boolean;
}) {
  const Icon = icon;

  const colors = {
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    orange: "bg-orange-50 text-orange-700",
    blue: "bg-blue-50 text-blue-700",
    indigo: "bg-indigo-50 text-indigo-700",
    purple: "bg-purple-50 text-purple-700",
    pink: "bg-pink-50 text-pink-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="rounded-xl border bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>

        <div className={`rounded-lg p-2 ${colors[color]}`}>
          <Icon color={color} />
        </div>
      </div>

      <h2 className="mt-2 text-2xl font-bold">
        {!loading ? value : <Loader className="animate-spin" />}
      </h2>
    </div>
  );
}

export default SummaryCardsGrid;
