import {
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  IndianRupee,
} from "lucide-react";

import type { SummaryCardConfig } from "../../components/summaryCard";
import type { FormFieldConfig } from "../../components/form";
import type { FilterFieldConfig } from "../../components/filter";

const transactionFormConfig: FormFieldConfig[] = [
  {
    key: "transaction_date",
    label: "Date",
    type: "date",
  },
  { key: "transaction_time", label: "Time", type: "time" },
  {
    key: "type",
    label: "Type",
    type: "select",
    options: [
      { label: "Expense", value: "expense" },
      { label: "Income", value: "income" },
      { label: "Loan", value: "loan" },
    ],
  },
  {
    key: "category",
    label: "Category",
    type: "combobox",
    options: [],
  },
  {
    key: "subcategory",
    label: "Subcategory",
    type: "combobox",
    options: [],
  },
  {
    key: "amount",
    label: "Amount",
    type: "number",
  },
  {
    key: "from_to",
    label: "From/To",
    type: "combobox",
    options: [],
  },
  {
    key: "payment_method",
    label: "Payment Method",
    type: "combobox",
    options: [],
  },
  {
    key: "reason",
    label: "Reason",
    type: "combobox",
    options: [],
  },
  {
    key: "remarks",
    label: "Remarks",
    type: "textarea",
    colSpan: 2,
  },
];

const transactionFilterConfig: FilterFieldConfig[] = [
  {
    key: "type",
    label: "Type",
    type: "select",
    options: [
      { label: "All", value: "all" },
      { label: "Income", value: "income" },
      { label: "Expense", value: "expense" },
      { label: "Loan", value: "loan" },
    ],
  },
  {
    key: "startDate",
    label: "Start Date",
    type: "date",
  },
  {
    key: "endDate",
    label: "End Date",
    type: "date",
  },
  {
    key: "minAmount",
    label: "Min Amount",
    type: "number",
  },
  {
    key: "maxAmount",
    label: "Max Amount",
    type: "number",
  },

  {
    key: "category",
    label: "Category",
    type: "select",
    options: [],
  },
  {
    key: "subcategory",
    label: "Subcategory",
    type: "select",
    options: [],
  },
  {
    key: "from_to",
    label: "From/To",
    type: "select",
    options: [],
  },
  {
    key: "payment_method",
    label: "Payment Method",
    type: "select",
    options: [],
  },
  {
    key: "reason",
    label: "Reason",
    type: "select",
    options: [],
  },
];

const transactionSummaryConfig: SummaryCardConfig[] = [
  {
    label: "Income",
    key: "income",
    cardIcon: ArrowDownCircle,
    formatter: (v) => `₹${Number(v).toFixed(2)}`,
    color: "green",
  },
  {
    label: "Expense",
    key: "expense",
    cardIcon: ArrowUpCircle,
    formatter: (v) => `₹${Number(v).toFixed(2)}`,
    color: "red",
  },
  {
    label: "Loan",
    key: "loan",
    cardIcon: Wallet,
    formatter: (v) => `₹${Number(v).toFixed(2)}`,
    color: "orange",
  },
  {
    label: "Balance",
    key: "balance",
    cardIcon: IndianRupee,
    formatter: (v) => `₹${Number(v).toFixed(2)}`,
    color: "blue",
  },
];

export {
  transactionFormConfig,
  transactionFilterConfig,
  transactionSummaryConfig,
};
