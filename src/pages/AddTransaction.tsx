import { useForm } from "react-hook-form";
import { supabase } from "../lib/supabase";
import type { Transaction } from "../types/database";
import Button from "../components/ui/button";

export default function AddTransaction() {
  const { register, handleSubmit, reset } = useForm<Transaction>();

  async function onSubmit(data: Transaction) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("transactions").insert([
      {
        ...data,
        user_id: user?.id,
      },
    ]);
    if (error) {
      alert(error.message);
      return;
    }

    alert("Transaction added");

    reset();
  }

  return (
    <div className="max-w-md mx-auto bg-white p-4 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Add Transaction</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input
          type="date"
          {...register("transaction_date")}
          className="w-full border p-2 rounded"
        />

        <select {...register("type")} className="w-full border p-2 rounded">
          <option value="out">Expense</option>
          <option value="in">Income</option>
          <option value="loan">Loan</option>
        </select>

        <input
          type="number"
          placeholder="Amount"
          {...register("amount")}
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Category"
          {...register("category")}
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Subcategory"
          {...register("subcategory")}
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Person / Shop"
          {...register("person")}
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Payment Method"
          {...register("payment_method")}
          className="w-full border p-2 rounded"
        />

        <textarea
          placeholder="Remarks"
          {...register("remarks")}
          className="w-full border p-2 rounded"
        />

        <Button className="w-full bg-black text-white p-2 rounded">Save</Button>
      </form>
    </div>
  );
}
