import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import useDashboardAnalytics from "../components/dashboard/useDashboardAnalytics";

import MoneySummaryCards from "../components/dashboard/MoneySummaryCard";
import FuelSummaryCards from "../components/dashboard/FuelSummaryCard";
import type { Transaction } from "./Transactions";
import type { FuelEntry } from "./Fuel";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchData();
  }, []);

  async function fetchData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const [tx, fuel] = await Promise.all([
      supabase.from("transactions").select("*").eq("user_id", user?.id),
      supabase.from("fuel_entries").select("*").eq("user_id", user?.id),
    ]);

    setTransactions(tx.data || []);
    setFuelEntries(fuel.data || []);
  }

  const analytics = useDashboardAnalytics(transactions, fuelEntries);

  return (
    <div className="p-4 space-y-6">
      <MoneySummaryCards data={analytics.money} />
      <FuelSummaryCards data={analytics.fuel} />
    </div>
  );
}
