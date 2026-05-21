import { Fuel, Gauge, IndianRupee, Route } from "lucide-react";
import type { FilterFieldConfig } from "../../components/filter";
import type { FormFieldConfig } from "../../components/form";
import type { SummaryCardConfig } from "../../components/summaryCard";

const fuelFilterConfig: FilterFieldConfig[] = [
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
    placeholder: "0",
  },
  {
    key: "maxAmount",
    label: "Max Amount",
    type: "number",
    placeholder: "1000",
  },
  {
    key: "fullTankOnly",
    label: "Full Tank",
    type: "toggle",
    activeText: "Full Tank Only",
    inactiveText: "All Fuel Types",
    colSpan: 2,
  },
];

const fuelFormConfig: FormFieldConfig[] = [
  {
    key: "fuel_date",
    label: "Fuel Date",
    type: "date",
  },
  {
    key: "fuel_time",
    label: "Fuel Time",
    type: "time",
  },
  {
    key: "litres",
    label: "Litres",
    type: "number",
  },
  {
    key: "amount",
    label: "Amount",
    type: "number",
  },
  {
    key: "odometer_km",
    label: "Odometer KM",
    type: "number",
  },
  {
    key: "is_full_tank",
    label: "Fuel Type",
    type: "toggle",
    activeText: "Full Tank",
    inactiveText: "Partial Tank",
  },
  {
    key: "remarks",
    label: "Remarks",
    type: "textarea",
    colSpan: 2,
  },
];

const fuelSummaryConfig: SummaryCardConfig[] = [
  {
    label: "Fuel Cost",
    key: "totalFuelCost",
    cardIcon: IndianRupee,
    formatter: (value: number | string) => `₹${Number(value).toFixed(2)}`,
    color: "indigo",
  },
  {
    label: "Total Litres",
    key: "totalLitres",
    cardIcon: Fuel,
    formatter: (value: number | string) => `${Number(value).toFixed(2)} L`,
    color: "red",
  },
  {
    label: "Travelled KM",
    key: "totalTravelledKm",
    cardIcon: Route,
    formatter: (value: number | string) => `${Number(value).toFixed(2)} KM`,
    color: "orange",
  },
  {
    label: "Avg Mileage",
    key: "averageMileage",
    cardIcon: Gauge,
    formatter: (value: number | string) => `${Number(value).toFixed(2)} KM/L`,
    color: "green",
  },
];

export { fuelFilterConfig, fuelFormConfig, fuelSummaryConfig };
