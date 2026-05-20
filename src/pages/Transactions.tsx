import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Filter,
  HandCoins,
  Plus,
  Wallet,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";

import Button from "../components/ui/button";
import Input from "../components/ui/input";
import Select from "../components/ui/select";
import Textarea from "../components/ui/textarea";
import Modal from "../components/ui/modal";
import ComboBoxInput from "../components/ui/combobox";
import ConfirmationModal from "../components/ui/confirmation";
import { useToast } from "../context/toast";

interface Transaction {
  id: string;
  created_at: string;
  transaction_date: string;
  type: "income" | "expense" | "loan";
  category: string;
  subcategory: string | null;
  amount: number;
  person: string | null;
  payment_method: string | null;
  reason: string | null;
  remarks: string | null;
}
interface TransactionForm {
  transaction_date: string;
  type: "income" | "expense" | "loan";
  category: string;
  subcategory: string;
  amount: number;
  person: string;
  payment_method: string;
  reason: string;
  remarks: string;
}

const initialForm: TransactionForm = {
  transaction_date: new Date().toISOString().split("T")[0],
  type: "expense",
  category: "",
  subcategory: "",
  amount: 0,
  person: "",
  payment_method: "cash",
  reason: "",
  remarks: "",
};

export default function TransactionsPage() {
  const toast = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState<TransactionForm>(initialForm);

  const [errors, setErrors] = useState({
    transaction_date: "",
    category: "",
    subcategory: "",
    amount: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<TransactionFilterState>({
    type: "all",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });

  const [appliedFilters, setAppliedFilters] =
    useState<TransactionFilterState>(filters);

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);

  const [deleteLoading, setDeleteLoading] = useState(false);
  useEffect(() => {
    fetchTransactions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchTransactions() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user?.id)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success("Transactions loaded successfully");
    setTransactions((data as Transaction[]) || []);

    setLoading(false);
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const f = appliedFilters;

      const typeMatch = f.type === "all" || t.type === f.type;

      const dateMatch =
        (!f.startDate || t.transaction_date >= f.startDate) &&
        (!f.endDate || t.transaction_date <= f.endDate);

      const amountMatch =
        (!f.minAmount || t.amount >= Number(f.minAmount)) &&
        (!f.maxAmount || t.amount <= Number(f.maxAmount));

      const categoryMatch =
        !f.category ||
        t.category?.toLowerCase().includes(f.category.toLowerCase());

      const subcategoryMatch =
        !f.subcategory ||
        t.subcategory?.toLowerCase().includes(f.subcategory.toLowerCase());

      const personMatch =
        !f.person || t.person?.toLowerCase().includes(f.person.toLowerCase());

      const paymentMatch =
        !f.payment_method ||
        t.payment_method
          ?.toLowerCase()
          .includes(f.payment_method.toLowerCase());

      const reasonMatch =
        !f.reason || t.reason?.toLowerCase().includes(f.reason.toLowerCase());

      let timeMatch = true;

      if (f.startTime || f.endTime) {
        const tTime = "00:00";

        timeMatch =
          (!f.startTime || tTime >= f.startTime) &&
          (!f.endTime || tTime <= f.endTime);
      }

      return (
        typeMatch &&
        dateMatch &&
        amountMatch &&
        categoryMatch &&
        subcategoryMatch &&
        personMatch &&
        paymentMatch &&
        reasonMatch &&
        timeMatch
      );
    });
  }, [transactions, appliedFilters]);

  function validateForm() {
    const newErrors = {
      transaction_date: "",
      category: "",
      subcategory: "",
      amount: "",
    };

    if (!form.transaction_date) newErrors.transaction_date = "Date is required";
    if (!form.category.trim()) newErrors.category = "Category is required";
    if (!form.subcategory.trim())
      newErrors.subcategory = "Subcategory is required";
    if (!form.amount || Number(form.amount) <= 0)
      newErrors.amount = "Amount must be greater than 0";

    setErrors(newErrors);

    return !Object.values(newErrors).some(Boolean);
  }

  function resetForm() {
    setForm(initialForm);
    setEditingTransaction(null);
    setShowForm(false);
  }

  function editTransaction(tx: Transaction) {
    setEditingTransaction(tx);

    setForm({
      transaction_date: tx.transaction_date,
      type: tx.type,
      category: tx.category ?? "",
      subcategory: tx.subcategory ?? "",
      amount: tx.amount,
      person: tx.person ?? "",
      payment_method: tx.payment_method ?? "cash",
      reason: tx.reason ?? "",
      remarks: tx.remarks ?? "",
    });

    setShowForm(true);
  }
  async function saveTransaction() {
    const isValid = validateForm();
    if (!isValid) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let error;

    if (editingTransaction) {
      const res = await supabase
        .from("transactions")
        .update({
          transaction_date: form.transaction_date,
          type: form.type,
          category: form.category.trim().toLowerCase(),
          subcategory: form.subcategory.trim().toLowerCase(),
          amount: Number(form.amount),
          person: form.person?.toLowerCase() || null,
          payment_method: form.payment_method?.toLowerCase() || null,
          reason: form.reason?.toLowerCase() || null,
          remarks: form.remarks,
        })
        .eq("id", editingTransaction.id);

      error = res.error;

      if (!error) toast.success("Transaction updated successfully");
    } else {
      const res = await supabase.from("transactions").insert([
        {
          user_id: user?.id,
          transaction_date: form.transaction_date,
          type: form.type,
          category: form.category.trim().toLowerCase(),
          subcategory: form.subcategory.trim().toLowerCase(),
          amount: Number(form.amount),
          person: form.person?.toLowerCase() || null,
          payment_method: form.payment_method?.toLowerCase() || null,
          reason: form.reason?.toLowerCase() || null,
          remarks: form.remarks,
        },
      ]);

      error = res.error;

      if (!error) toast.success("Transaction added successfully");
    }

    if (error) {
      toast.error(error.message);
      return;
    }

    resetForm();
    setShowForm(false);
    fetchTransactions();
  }

  function openDeleteTransaction(id: string) {
    setSelectedTransactionId(id);
    setShowDeleteModal(true);
  }
  async function confirmDeleteTransaction() {
    if (!selectedTransactionId) return;

    setDeleteLoading(true);

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", selectedTransactionId);

    setDeleteLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Transaction deleted successfully");

    setShowDeleteModal(false);
    setSelectedTransactionId(null);

    fetchTransactions();
  }

  const summary = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.totalIncome += Number(transaction.amount);
        }

        if (transaction.type === "expense") {
          acc.totalExpense += Number(transaction.amount);
        }

        if (transaction.type === "loan") {
          acc.totalLoan += Number(transaction.amount);
        }

        return acc;
      },
      {
        totalIncome: 0,
        totalExpense: 0,
        totalLoan: 0,
      },
    );
  }, [filteredTransactions]);

  const balance =
    summary.totalIncome - summary.totalExpense - summary.totalLoan;

  const categories = useMemo(() => {
    return [
      ...new Set(filteredTransactions.map((t) => t.category.toLowerCase())),
    ]
      .filter(Boolean)
      .sort();
  }, [filteredTransactions]);

  const subcategories: string[] = useMemo(() => {
    return [
      ...new Set(
        transactions
          .filter(
            (t) => t.category.toLowerCase() === form.category.toLowerCase(),
          )
          .map((t) => t.subcategory?.toLowerCase() || ""),
      ),
    ]
      .filter(Boolean)
      .sort();
  }, [transactions, form.category]);

  const paymentMethods: string[] = useMemo(() => {
    return [
      ...new Set(
        filteredTransactions.map((t) => t.payment_method?.toLowerCase() || ""),
      ),
    ]
      .filter(Boolean)
      .sort();
  }, [filteredTransactions]);

  const persons: string[] = useMemo(() => {
    return [
      ...new Set(
        filteredTransactions.map((t) => t.person?.toLowerCase() || ""),
      ),
    ]
      .filter(Boolean)
      .sort();
  }, [filteredTransactions]);

  const reasons: string[] = useMemo(() => {
    return [
      ...new Set(
        filteredTransactions.map((t) => t.reason?.toLowerCase() || ""),
      ),
    ]
      .filter(Boolean)
      .sort();
  }, [filteredTransactions]);

  return (
    <>
      <div className="space-y-4 p-4">
        <div className="rounded-xl bg-white p-4 shadow">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Overview</h2>

              <p className="text-sm text-gray-500">Financial summary</p>
            </div>
            <div className="flex items-center gap-2">
              <TransactionFilters
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                filters={filters}
                setFilters={setFilters}
                setAppliedFilters={setAppliedFilters}
                categories={categories}
                persons={persons}
                paymentMethods={paymentMethods}
                transactions={transactions}
              />
              <Button
                leftIcon={<Plus size={18} />}
                onClick={() => setShowForm(true)}
              >
                Add Transaction
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Income"
              value={`₹${summary.totalIncome.toFixed(2)}`}
              icon={<ArrowDownCircle size={20} />}
              color="green"
            />

            <SummaryCard
              title="Expense"
              value={`₹${summary.totalExpense.toFixed(2)}`}
              icon={<ArrowUpCircle size={20} />}
              color="red"
            />

            <SummaryCard
              title="Loan"
              value={`₹${summary.totalLoan.toFixed(2)}`}
              icon={<HandCoins size={20} />}
              color="orange"
            />

            <SummaryCard
              title="Balance"
              value={`₹${balance.toFixed(2)}`}
              icon={<Wallet size={20} />}
              color={balance >= 0 ? "green" : "red"}
            />
          </div>
        </div>

        <div className="sticky top-[88px] h-[calc(100vh-120px)] overflow-hidden rounded-xl bg-white shadow">
          <div className="border-b px-4 py-3">
            <h2 className="text-lg font-semibold">Transaction History</h2>

            <p className="text-sm text-gray-500">
              {transactions.length} entries found
            </p>
          </div>

          <div className="h-[calc(100%-73px)] overflow-y-auto p-4">
            <div className="space-y-3">
              {loading && (
                <div className="rounded-lg border bg-gray-50 p-4">
                  Loading...
                </div>
              )}

              {!loading && transactions.length === 0 && (
                <div className="rounded-lg border bg-gray-50 p-4 text-gray-500">
                  No transactions found
                </div>
              )}

              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="space-y-4 rounded-xl border bg-white p-4"
                >
                  {/* HEADER */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold capitalize">
                        {transaction.category}
                      </h3>

                      <p className="text-sm text-gray-500 capitalize">
                        {transaction.subcategory || "-"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : transaction.type === "expense"
                              ? "text-red-600"
                              : "text-orange-600"
                        }`}
                      >
                        ₹{transaction.amount}
                      </p>

                      <p className="text-xs capitalize text-gray-500">
                        {transaction.type}
                      </p>
                    </div>
                  </div>

                  {/* GRID DETAILS */}
                  <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Date</p>
                      <p className="font-medium">
                        {transaction.transaction_date}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Person</p>
                      <p className="font-medium capitalize">
                        {transaction.person || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Payment Method</p>
                      <p className="font-medium capitalize">
                        {transaction.payment_method || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Reason</p>
                      <p className="font-medium capitalize">
                        {transaction.reason || "-"}
                      </p>
                    </div>
                  </div>

                  {/* REMARKS */}
                  {transaction.remarks && (
                    <div className="border-t pt-2">
                      <p className="text-sm text-gray-600">
                        {transaction.remarks}
                      </p>
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => editTransaction(transaction)}
                      className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 hover:cursor-pointer"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => openDeleteTransaction(transaction.id)}
                      className="rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 hover:cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add Transaction"
        actions={[
          {
            label: "Cancel",
            variant: "secondary",
            onClick: () => setShowForm(false),
          },
          {
            label: "Save",
            onClick: saveTransaction,
          },
        ]}
      >
        <div className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={form.transaction_date}
            error={errors.transaction_date}
            onChange={(value) =>
              setForm({
                ...form,
                transaction_date: value,
              })
            }
          />

          <Select
            label="Transaction Type"
            value={form.type}
            onChange={(value) =>
              setForm({
                ...form,
                type: value as TransactionForm["type"],
              })
            }
            options={[
              {
                label: "Expense",
                value: "expense",
              },
              {
                label: "Income",
                value: "income",
              },
              {
                label: "Loan",
                value: "loan",
              },
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <ComboBoxInput
                label="Category"
                value={form.category}
                error={errors.category}
                placeholder="Food"
                options={categories}
                onChange={(v) =>
                  setForm({
                    ...form,
                    category: v,
                  })
                }
              />
            </div>

            <div>
              <ComboBoxInput
                label="Subcategory"
                value={form.subcategory}
                error={errors.subcategory}
                placeholder="Petrol"
                options={subcategories || []}
                onChange={(v) =>
                  setForm({
                    ...form,
                    subcategory: v,
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount"
              type="number"
              value={form.amount}
              error={errors.amount}
              onChange={(value) =>
                setForm({
                  ...form,
                  amount: Number(value),
                })
              }
            />
            <ComboBoxInput
              label="Payment Method"
              value={form.payment_method ?? "UPI"}
              onChange={(v) =>
                setForm({
                  ...form,
                  payment_method: v,
                })
              }
              options={paymentMethods}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ComboBoxInput
              label="Person"
              value={form.person}
              onChange={(v) =>
                setForm({
                  ...form,
                  person: v,
                })
              }
              options={persons}
            />
            <ComboBoxInput
              label="Reason"
              value={form.reason}
              onChange={(v) =>
                setForm({
                  ...form,
                  reason: v,
                })
              }
              options={reasons}
            />
          </div>

          <Textarea
            label="Remarks"
            value={form.remarks}
            onChange={(value) =>
              setForm({
                ...form,
                remarks: value,
              })
            }
          />
        </div>
      </Modal>
      <ConfirmationModal
        open={showDeleteModal}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction?"
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteTransaction}
      />
    </>
  );
}

export interface TransactionFilterState {
  type: "all" | "income" | "expense" | "loan";

  startDate: string;
  endDate: string;

  startTime?: string;
  endTime?: string;

  minAmount: string;
  maxAmount: string;
  subcategory?: string;
  category?: string;
  person?: string;
  payment_method?: string;
  reason?: string;
}

interface FilterProps {
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  transactions: Transaction[];

  filters: TransactionFilterState;
  setFilters: React.Dispatch<React.SetStateAction<TransactionFilterState>>;
  categories: string[];
  persons: string[];
  paymentMethods: string[];
  setAppliedFilters: React.Dispatch<
    React.SetStateAction<TransactionFilterState>
  >;
}

function TransactionFilters({
  showFilters,
  setShowFilters,
  filters,
  setFilters,
  setAppliedFilters,
  categories,
  persons,
  paymentMethods,
  transactions,
}: FilterProps) {
  const subcategories: string[] = useMemo(() => {
    return [
      ...new Set(
        transactions
          .filter(
            (t) => t.category.toLowerCase() === filters.category?.toLowerCase(),
          )
          .map((t) => t.subcategory?.toLowerCase() || ""),
      ),
    ]
      .filter(Boolean)
      .sort();
  }, [transactions, filters.category]);
  return (
    <div className="relative">
      {/* BUTTON */}
      <Button
        variant="outline"
        leftIcon={<Filter size={16} />}
        onClick={() => setShowFilters(!showFilters)}
      >
        Filters
      </Button>

      {/* DROPDOWN */}
      {showFilters && (
        <div className="absolute right-0 top-12 z-50 w-[360px] space-y-4 rounded-lg border bg-white p-4 shadow-xl">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>

            <button
              onClick={() => setShowFilters(false)}
              className="rounded-md p-1 hover:bg-gray-100 hover:cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* TYPE */}
          <Select
            label="Type"
            value={filters.type}
            onChange={(value) =>
              setFilters({
                ...filters,
                type: value as TransactionFilterState["type"],
              })
            }
            options={[
              { label: "All", value: "all" },
              { label: "Income", value: "income" },
              { label: "Expense", value: "expense" },
              { label: "Loan", value: "loan" },
            ]}
          />

          {/* DATE RANGE */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(value) => setFilters({ ...filters, startDate: value })}
            />

            <Input
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(value) => setFilters({ ...filters, endDate: value })}
            />
          </div>

          {/* AMOUNT RANGE */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min Amount"
              type="number"
              value={filters.minAmount}
              onChange={(value) => setFilters({ ...filters, minAmount: value })}
            />

            <Input
              label="Max Amount"
              type="number"
              value={filters.maxAmount}
              onChange={(value) => setFilters({ ...filters, maxAmount: value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* CATEGORY */}
            <Select
              label="Category"
              value={filters.category}
              onChange={(value) => setFilters({ ...filters, category: value })}
              options={[
                { label: "All", value: "" },
                ...categories.map((c) => ({
                  label: c,
                  value: c,
                })),
              ]}
            />

            {/* SUBCATEGORY */}
            <Select
              label="Subcategory"
              value={filters.subcategory}
              onChange={(value) =>
                setFilters({ ...filters, subcategory: value })
              }
              options={[
                { label: "All", value: "" },
                ...subcategories.map((s) => ({
                  label: s,
                  value: s,
                })),
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* PERSON */}
            <Select
              label="Person"
              value={filters.person}
              onChange={(value) => setFilters({ ...filters, person: value })}
              options={[
                { label: "All", value: "" },
                ...persons.map((p) => ({
                  label: p,
                  value: p,
                })),
              ]}
            />

            {/* PAYMENT METHOD */}
            <Select
              label="Payment Method"
              value={filters.payment_method}
              onChange={(value) =>
                setFilters({ ...filters, payment_method: value })
              }
              options={[
                { label: "All", value: "" },
                ...paymentMethods.map((p) => ({
                  label: p,
                  value: p,
                })),
              ]}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                const reset: TransactionFilterState = {
                  type: "all",
                  startDate: "",
                  endDate: "",
                  minAmount: "",
                  maxAmount: "",
                  category: "",
                  subcategory: "",
                  person: "",
                  payment_method: "",
                  reason: "",
                };

                setFilters(reset);
                setAppliedFilters(reset);
              }}
            >
              Reset
            </Button>

            <Button
              onClick={() => {
                setAppliedFilters(filters);
                setShowFilters(false);
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "green" | "red" | "orange";
}) {
  const colors = {
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <div className="rounded-xl border bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>

        <div className={`rounded-lg p-2 ${colors[color]}`}>{icon}</div>
      </div>

      <h2 className="mt-2 text-2xl font-bold">{value}</h2>
    </div>
  );
}
