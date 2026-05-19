import type { Transaction } from "../../pages/Transactions";

export function getMonthlyTotals(transactions: Transaction[]) {
  const map: Record<string, { income: number; expense: number; loan: number }> =
    {};

  transactions.forEach((t) => {
    const month = t.transaction_date.slice(0, 7); // YYYY-MM

    if (!map[month]) {
      map[month] = { income: 0, expense: 0, loan: 0 };
    }

    map[month][t.type] += Number(t.amount);
  });

  return Object.entries(map).map(([month, v]) => ({
    month,
    ...v,
    balance: v.income - v.expense - v.loan,
  }));
}

export function getCategoryBreakdown(transactions: Transaction[]) {
  const map: Record<string, number> = {};

  transactions.forEach((t) => {
    if (t.type === "expense") {
      map[t.category] = (map[t.category] || 0) + Number(t.amount);
    }
  });

  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
  }));
}

export function getTotals(transactions: Transaction[]) {
  return transactions.reduce(
    (acc, t) => {
      acc[t.type] += Number(t.amount);
      return acc;
    },
    { income: 0, expense: 0, loan: 0 },
  );
}
