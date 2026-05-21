import { CalendarDays, Clock3, Gauge, Route } from "lucide-react";

import type { SummaryCardConfig } from "../../components/summaryCard";
import type { FormFieldConfig } from "../../components/form";
import type { FilterFieldConfig } from "../../components/filter";

export const shiftFormConfig: FormFieldConfig[] = [
  {
    key: "shift_date",
    label: "Shift Date",
    type: "date",
  },
  {
    key: "shift",
    label: "Shift",
    type: "select",
    options: [
      { label: "Morning", value: "morning" },
      { label: "Afternoon", value: "afternoon" },
      { label: "Evening", value: "evening" },
      { label: "Night", value: "night" },
    ],
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
    key: "shift_start_time",
    label: "Start Time",
    type: "time",
  },
  {
    key: "shift_end_time",
    label: "End Time",
    type: "time",
  },
  {
    key: "remarks",
    label: "Remarks",
    type: "textarea",
    colSpan: 2,
    placeholder: "Optional notes...",
  },
];

export const shiftFilterConfig: FilterFieldConfig[] = [
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

export const shiftSummaryConfig: SummaryCardConfig[] = [
  {
    label: "Total Shifts",
    key: "totalShifts",
    cardIcon: CalendarDays,
    formatter: (value: number | string) => `${value} shifts`,
    color: "blue",
  },
  {
    label: "Total Distance",
    key: "totalDistance",
    cardIcon: Route,
    formatter: (value: number | string) => `${Number(value).toFixed(2)} KM`,
    color: "green",
  },
  {
    label: "Average Distance",
    key: "averageDistance",
    cardIcon: Gauge,
    formatter: (value: number | string) => `${Number(value).toFixed(2)} KM`,
    color: "orange",
  },

  {
    label: "Total Hours",
    key: "totalHours",
    cardIcon: Clock3,
    formatter: (value: number | string) => `${Number(value).toFixed(1)} hrs`,
    color: "indigo",
  },
];
