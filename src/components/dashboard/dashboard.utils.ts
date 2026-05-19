export function groupByMonth(data: { date: string; amount: number }[]) {
  const map: Record<string, number> = {};

  data.forEach((item) => {
    const month = item.date.slice(0, 7);
    map[month] = (map[month] || 0) + item.amount;
  });

  return Object.entries(map).map(([month, amount]) => ({
    month,
    amount,
  }));
}

export function groupByCategory(data: { category: string; amount: number }[]) {
  const map: Record<string, number> = {};

  data.forEach((item) => {
    map[item.category] = (map[item.category] || 0) + item.amount;
  });

  return Object.entries(map).map(([category, amount]) => ({
    category,
    amount,
  }));
}
