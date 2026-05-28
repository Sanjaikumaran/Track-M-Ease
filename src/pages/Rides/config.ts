import {
  IndianRupee,
  Motorbike,
  Route,
  Percent,
  Wallet,
  HandCoins,
} from "lucide-react";

import type { SummaryCardConfig } from "../../components/summaryCard";
import type { FormFieldConfig } from "../../components/form";
import type { FilterFieldConfig } from "../../components/filter";

const rideFormConfig: FormFieldConfig[] = [
  {
    key: "ride_date",
    label: "Ride Date",
    type: "date",
  },
  {
    key: "ride_type",
    label: "Ride Type",
    type: "select",
    options: [
      { label: "Passenger", value: "passenger" },
      { label: "Parcel", value: "parcel" },
    ],
  },
  {
    key: "ride_start_time",
    label: "Ride Start Time",
    type: "time",
  },
  {
    key: "ride_end_time",
    label: "Ride End Time",
    type: "time",
  },
  {
    key: "start_km",
    label: "Start KM",
    type: "number",
  },
  {
    key: "end_km",
    label: "End KM",
    type: "number",
  },
  {
    key: "earning",
    label: "Earning",
    type: "number",
  },
  {
    key: "commission",
    label: "Commission",
    type: "number",
  },
  {
    key: "extra_amount",
    label: "Extra Amount",
    type: "number",
  },
  {
    key: "remarks",
    label: "Remarks",
    type: "textarea",
    colSpan: 2,
  },
];

const rideFilterConfig: FilterFieldConfig[] = [
  {
    key: "rideType",
    label: "Ride Type",
    type: "select",
    options: [
      { label: "All", value: "all" },
      { label: "Passenger", value: "passenger" },
      { label: "Parcel", value: "parcel" },
    ],
  },
  {
    key: "shift",
    label: "Shift",
    type: "select",
    options: [
      { label: "All", value: "all" },
      { label: "Morning", value: "morning" },
      { label: "Afternoon", value: "afternoon" },
      { label: "Evening", value: "evening" },
      { label: "Night", value: "night" },
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
    key: "minEarning",
    label: "Min Earning",
    type: "number",
  },
  {
    key: "maxEarning",
    label: "Max Earning",
    type: "number",
  },
  {
    key: "minNetProfit",
    label: "Min Net Profit",
    type: "number",
  },
  {
    key: "maxNetProfit",
    label: "Max Net Profit",
    type: "number",
  },
  {
    key: "minDistance",
    label: "Min Distance",
    type: "number",
  },
  {
    key: "maxDistance",
    label: "Max Distance",
    type: "number",
  },
];

const rideSummaryConfig: SummaryCardConfig[] = [
  {
    label: "Total Earnings",
    key: "totalEarnings",
    cardIcon: IndianRupee,
    formatter: (value: number | string) => `₹${Number(value).toFixed(2)}`,
    color: "green",
  },
  {
    label: "Ride Earnings",
    key: "rideEarnings",
    cardIcon: Motorbike,
    formatter: (value: number | string) => `₹${Number(value).toFixed(2)}`,
    color: "blue",
  },
  {
    label: "Commission",
    key: "totalCommission",
    cardIcon: Percent,
    formatter: (value: number | string) => `₹${Number(value).toFixed(2)}`,
    color: "red",
  },
  {
    label: "Extra Amount",
    key: "totalExtra",
    cardIcon: HandCoins,
    formatter: (value: number | string) => `₹${Number(value).toFixed(2)}`,
    color: "indigo",
  },
  {
    label: "Net Profit",
    key: "netProfit",
    cardIcon: Wallet,
    formatter: (value: number | string) => `₹${Number(value).toFixed(2)}`,
    color: "purple",
  },

  {
    label: "Total KM",
    key: "totalKm",
    cardIcon: Route,
    formatter: (value: number | string) => `${Number(value).toFixed(2)} KM`,
    color: "orange",
  },
];

export { rideFormConfig, rideFilterConfig, rideSummaryConfig };
