import type { FormFieldConfig } from "../../components/form";

const bikeFormConfig: FormFieldConfig[] = [
  {
    key: "bike_number",
    label: "Bike Number",
    type: "text",
    colSpan: 2,
  },
  {
    key: "brand",
    label: "Brand",
    type: "text",
    colSpan: 2,
  },
  {
    key: "model",
    label: "Model",
    type: "text",
    colSpan: 2,
  },
  {
    key: "year",
    label: "Year",
    type: "number",
    colSpan: 2,
  },
  {
    key: "owner",
    label: "Owner",
    type: "text",
    colSpan: 2,
  },
];

export { bikeFormConfig };
