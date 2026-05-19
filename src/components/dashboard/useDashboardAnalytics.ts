import { useMemo } from "react";
import type { FuelEntry } from "../../pages/Fuel";
import type { Transaction } from "../../pages/Transactions";
import type { DashboardAnalytics } from "./dashboard.types";

export default function useDashboardAnalytics(
  transactions: Transaction[],
  fuelEntries: FuelEntry[],
): DashboardAnalytics {
  const money = useMemo(() => {
    let income = 0;
    let expense = 0;
    let loan = 0;

    transactions.forEach((t) => {
      if (t.type === "income") income += t.amount;
      if (t.type === "expense") expense += t.amount;
      if (t.type === "loan") loan += t.amount;
    });

    return {
      income,
      expense,
      loan,
      balance: income - expense - loan,
    };
  }, [transactions]);

  const fuel = useMemo(() => {
    let totalCost = 0;
    let totalLitres = 0;
    let totalKm = 0;

    fuelEntries.forEach((f) => {
      totalCost += f.amount;
      totalLitres += f.litres;
      totalKm += f.travelled_km || 0;
    });

    return {
      totalCost,
      totalLitres,
      avgMileage: totalLitres ? totalKm / totalLitres : 0,
      costPerKm: totalKm ? totalCost / totalKm : 0,
    };
  }, [fuelEntries]);

  return { money, fuel };
}
