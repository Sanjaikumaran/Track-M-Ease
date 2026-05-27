import { useEffect, useMemo, useRef, useState } from "react";

import SupabaseService from "../../lib/supabase";
import LocalDB from "../../lib/indexDb";

import { useToast } from "../../context/toast";
import { useDeleteConfirmation } from "../../context/deleteEntry";

import GenericFilters from "../../components/filter";
import GenericFormModal from "../../components/form";
import SummaryCardsGrid from "../../components/summaryCard";
import List from "../../components/list";

import {
  transactionFormConfig,
  transactionFilterConfig,
  transactionSummaryConfig,
} from "./config";
import { formatDate, formatTime12Hour } from "../../lib/helpers";

interface Transaction {
  id?: string;
  created_at?: string;

  transaction_date: string;
  transaction_time?: string;
  type: "income" | "expense" | "loan";

  amount: number;

  category: string;
  subcategory?: string | null;

  from_to?: string | null;
  payment_method?: string | null;
  reason?: string | null;
  remarks?: string | null;

  user_id?: string;
}

type FilterState = {
  type: "all" | "income" | "expense" | "loan";
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;

  category?: string;
  subcategory?: string;
  from_to?: string;
  payment_method?: string;
  reason?: string;
};

const initialForm: Transaction = {
  transaction_date: new Date().toISOString().split("T")[0],
  transaction_time: new Date().toTimeString().slice(0, 5),
  type: "expense",
  amount: 0,
  category: "",
  subcategory: "",
  from_to: "",
  payment_method: "",
  reason: "",
  remarks: "",
};

const initialFilters: FilterState = {
  type: "all",
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
  category: "",
  subcategory: "",
  from_to: "",
  payment_method: "",
  reason: "",
};

const initialErrors: Record<string, string> = {
  transaction_date: "",
  type: "",
  amount: "",
  category: "",
  payment_method: "",
};

const Transactions = () => {
  const service = new SupabaseService<Transaction>("transactions");

  const toast = useToast();
  const { confirmDelete } = useDeleteConfirmation();

  const fetchedRef = useRef(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Transaction>(initialForm);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [errors, setErrors] = useState(initialErrors);

  const [drafts, setDrafts] = useState<Transaction[]>([]);
  const [draftFilters, setDraftFilters] = useState<FilterState>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(initialFilters);
  const [showDrafts, setShowDrafts] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    setShowDrafts(false);

    const { data, error } = await service.getAll(
      ["transaction_date", "transaction_time"],
      "desc",
    );

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setTransactions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = (data: Transaction) => {
    const err = { ...initialErrors };

    if (!data.transaction_date)
      err.transaction_date = "Transaction date is required";
    if (!data.type) err.type = "Type is required";
    if (!data.category) err.category = "Category is required";
    if (!data.payment_method) err.payment_method = "Payment method is required";
    if (!data.amount || data.amount <= 0) err.amount = "Invalid amount";

    setErrors(err);
    return !Object.values(err).some(Boolean);
  };

  const saveTransaction = async (data: Transaction) => {
    if (!validate(data)) return;

    if (showDrafts && editingTransaction) {
      await LocalDB.remove("transactions", editingTransaction.id!);
    }

    const payload = {
      ...data,
      category: data.category?.toLowerCase(),
      subcategory: data.subcategory?.toLowerCase(),
      from_to: data.from_to?.toLowerCase(),
      payment_method: data.payment_method?.toLowerCase(),
      reason: data.reason?.toLowerCase(),
    };

    const { error } =
      editingTransaction && !showDrafts
        ? await service.update(editingTransaction.id!, payload)
        : await service.create(payload);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(
      editingTransaction ? "Updated successfully" : "Created successfully",
    );

    setEditingTransaction(null);
    setErrors(initialErrors);
    fetchTransactions();
  };

  const deleteTransaction = async (id: string) => {
    await confirmDelete({
      title: "Delete Transaction",
      message: "Are you sure you want to delete this transaction?",
      confirmText: "Delete",
      confirmVariant: "danger",
      onConfirm: async () => {
        const { error } = await service.delete(id);

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success("Deleted successfully");
        fetchTransactions();
      },
    });
  };

  const saveTransactionAsDraft = async (t: Transaction) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2) + Date.now().toString(36);

    const draft = {
      ...t,
      id,
      created_at: new Date().toISOString(),
    };

    await LocalDB.create("transactions", draft);

    toast.success("Saved as draft");
  };

  const getAllDrafts = async () => {
    setShowDrafts(true);
    const drafts = await LocalDB.getAll("transactions");

    setDrafts(drafts || []);
  };

  const deleteDraft = async (id: string) => {
    await confirmDelete({
      title: "Delete Transaction Draft",
      message: "Are you sure you want to delete this transaction draft?",
      confirmText: "Delete",
      confirmVariant: "danger",
      onConfirm: async () => {
        await LocalDB.remove("transactions", id);

        toast.success("Draft deleted");

        setShowDrafts(false);
        fetchTransactions();
      },
    });
  };

  const filtered = useMemo(() => {
    const data = showDrafts ? drafts : transactions;
    return data.filter((t) => {
      const f = appliedFilters;

      return (
        (f.type === "all" || t.type === f.type) &&
        (!f.startDate || t.transaction_date >= f.startDate) &&
        (!f.endDate || t.transaction_date <= f.endDate) &&
        (!f.minAmount || t.amount >= Number(f.minAmount)) &&
        (!f.maxAmount || t.amount <= Number(f.maxAmount)) &&
        (!f.category ||
          t.category?.toLowerCase()?.includes(f.category.toLowerCase())) &&
        (!f.subcategory ||
          t.subcategory
            ?.toLowerCase()
            ?.includes(f.subcategory.toLowerCase())) &&
        (!f.from_to ||
          t.from_to?.toLowerCase()?.includes(f.from_to.toLowerCase())) &&
        (!f.payment_method ||
          t.payment_method
            ?.toLowerCase()
            ?.includes(f.payment_method.toLowerCase())) &&
        (!f.reason || t.reason?.toLowerCase()?.includes(f.reason.toLowerCase()))
      );
    });
  }, [transactions, appliedFilters, showDrafts, drafts]);

  const summary = useMemo(() => {
    return filtered.reduce(
      (acc, t) => {
        if (t.type === "income") acc.income += Number(t.amount);
        if (t.type === "expense") acc.expense += Number(t.amount);
        if (t.type === "loan") acc.loan += Number(t.amount);
        return acc;
      },
      { income: 0, expense: 0, loan: 0 },
    );
  }, [filtered]);

  const balance = summary.income - summary.expense - summary.loan;

  const categories = useMemo(() => {
    return [
      ...new Set(
        transactions
          .map((t) => t.category?.trim().toLowerCase())
          .filter((v): v is string => Boolean(v)),
      ),
    ].sort();
  }, [transactions]);

  const subcategories = useMemo(() => {
    const category =
      draftFilters.category?.toLowerCase() || formData.category?.toLowerCase();
    if (!category) return [];

    return [
      ...new Set(
        transactions
          .filter((t) => t.category?.toLowerCase() === category?.toLowerCase())
          .map((t) => t.subcategory?.trim().toLowerCase())
          .filter((v): v is string => Boolean(v)),
      ),
    ].sort();
  }, [transactions, formData.category, draftFilters.category]);

  const paymentMethods = useMemo(() => {
    return [
      ...new Set(
        transactions
          .map((t) => t.payment_method?.trim().toLowerCase())
          .filter((v): v is string => Boolean(v)),
      ),
    ].sort();
  }, [transactions]);

  const fromToOptions = useMemo(() => {
    const category =
      draftFilters.category?.toLowerCase() || formData.category?.toLowerCase();

    const subcategory =
      draftFilters.subcategory?.toLowerCase() ||
      formData.subcategory?.toLowerCase();

    if (!category) return [];

    return [
      ...new Set(
        transactions
          .filter(
            (t) =>
              t.category?.toLowerCase() === category?.toLowerCase() &&
              t.subcategory?.toLowerCase() === subcategory?.toLowerCase(),
          )
          .map((t) => t.from_to?.trim().toLowerCase())
          .filter((v): v is string => Boolean(v)),
      ),
    ].sort();
  }, [
    transactions,
    formData.category,
    draftFilters.category,
    formData.subcategory,
    draftFilters.subcategory,
  ]);

  const reasons = useMemo(() => {
    const category =
      draftFilters.category?.toLowerCase() || formData.category?.toLowerCase();

    const subcategory =
      draftFilters.subcategory?.toLowerCase() ||
      formData.subcategory?.toLowerCase();

    if (!category) return [];
    return [
      ...new Set(
        transactions
          .filter(
            (t) =>
              t.category?.toLowerCase() === category?.toLowerCase() &&
              t.subcategory?.toLowerCase() === subcategory?.toLowerCase(),
          )
          .map((t) => t.reason?.trim().toLowerCase())
          .filter((v): v is string => Boolean(v)),
      ),
    ].sort();
  }, [
    transactions,
    formData.category,
    draftFilters.category,
    formData.subcategory,
    draftFilters.subcategory,
  ]);

  const formConfig = useMemo(() => {
    return transactionFormConfig.map((field) => {
      if (field.type !== "combobox") return field;

      if (field.key === "category") {
        return { ...field, options: categories };
      }

      if (field.key === "subcategory") {
        return { ...field, options: subcategories };
      }

      if (field.key === "from_to") {
        return { ...field, options: fromToOptions };
      }

      if (field.key === "payment_method") {
        return { ...field, options: paymentMethods };
      }

      if (field.key === "reason") {
        return { ...field, options: reasons };
      }

      return field;
    });
  }, [categories, subcategories, fromToOptions, paymentMethods, reasons]);

  const filterConfig = useMemo(() => {
    return transactionFilterConfig.map((field) => {
      if (field.type !== "select") return field;

      if (field.key === "category") {
        return {
          ...field,
          options: categories.map((c) => ({ label: c, value: c })),
        };
      }

      if (field.key === "subcategory") {
        return {
          ...field,
          options: subcategories.map((s) => ({ label: s, value: s })),
        };
      }

      if (field.key === "from_to") {
        return {
          ...field,
          options: fromToOptions.map((f) => ({ label: f, value: f })),
        };
      }

      if (field.key === "payment_method") {
        return {
          ...field,
          options: paymentMethods.map((p) => ({ label: p, value: p })),
        };
      }

      if (field.key === "reason") {
        return {
          ...field,
          options: reasons.map((r) => ({ label: r, value: r })),
        };
      }

      return field;
    });
  }, [categories, subcategories, fromToOptions, paymentMethods, reasons]);
  return (
    <div className="space-y-4 p-4">
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Transactions Summary</h2>

            <p className="text-sm text-gray-500">Daily transactions overview</p>
          </div>

          <div className="flex gap-2">
            <GenericFilters
              title="Transaction Filters"
              filters={appliedFilters}
              setFilters={setAppliedFilters}
              initialFilters={initialFilters}
              config={filterConfig}
              onChange={(data) => {
                setDraftFilters(data);
              }}
              onClose={() => {
                setDraftFilters(appliedFilters);
              }}
            />

            <GenericFormModal
              title={
                editingTransaction && !showDrafts
                  ? "Edit Transaction"
                  : "Add Transaction"
              }
              config={formConfig}
              initialData={initialForm}
              editingData={editingTransaction || undefined}
              errors={errors}
              onSubmit={saveTransaction}
              onDraft={!editingTransaction ? saveTransactionAsDraft : undefined}
              submitLabel={
                editingTransaction && !showDrafts ? "Update" : "Save"
              }
              onClose={() => {
                setEditingTransaction(null);
                setFormData(initialForm);
                setErrors(initialErrors);
              }}
              onChange={(data) => {
                setFormData(data);
              }}
            />
          </div>
        </div>
        <SummaryCardsGrid
          loading={loading}
          config={transactionSummaryConfig}
          data={{
            income: summary.income,
            expense: summary.expense,
            loan: summary.loan,
            balance,
          }}
          cols={4}
        />
      </div>

      <List
        header="Transaction History"
        items={filtered}
        loading={loading}
        actions={[
          {
            label: showDrafts ? "Show Online Transactions" : "Show Drafts",
            onClick: showDrafts ? fetchTransactions : getAllDrafts,
            variant: "outline",
          },
        ]}
      >
        {filtered.map((t) => (
          <div
            key={t.id}
            className="space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold capitalize text-gray-900">
                  {t.category}
                </h3>

                <p className="mt-1 text-sm text-gray-500 capitalize">
                  {t.subcategory || "-"}
                </p>
              </div>

              <div className="text-right">
                <p
                  className={`text-xl font-bold ${
                    t.type === "income"
                      ? "text-green-600"
                      : t.type === "expense"
                        ? "text-red-600"
                        : "text-orange-600"
                  }`}
                >
                  ₹{Number(t.amount || 0).toFixed(2)}
                </p>

                <p className="text-xs text-gray-400 capitalize">{t.type}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Date</p>
                <p className="font-medium text-gray-700">
                  {formatDate(t.transaction_date)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Time</p>
                <p className="font-medium text-gray-700 capitalize">
                  {formatTime12Hour(t.transaction_time) || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  {t.type === "income" ? "From" : "To"}
                </p>
                <p className="font-medium text-gray-700 capitalize">
                  {t.from_to || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Reason</p>
                <p className="font-medium text-gray-700 capitalize">
                  {t.reason || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="capitalize rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {t.payment_method || "Upi"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingTransaction(t)}
                  className="hover:cursor-pointer rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                >
                  Edit
                </button>

                <button
                  onClick={() => {
                    if (showDrafts) {
                      deleteDraft(t.id || "");
                      return;
                    }
                    deleteTransaction(t.id || "");
                  }}
                  className="hover:cursor-pointer rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
            {t.remarks && (
              <div className="border-t border-gray-100 pt-3">
                <p className="text-sm leading-relaxed text-gray-600">
                  {t.remarks}
                </p>
              </div>
            )}
          </div>
        ))}
      </List>
    </div>
  );
};

export default Transactions;
