import { useState } from "react";
import { Filter, X } from "lucide-react";

import Button from "./ui/button";
import Input from "./ui/input";
import Select from "./ui/select";

type BaseFieldConfig = {
  key: string;
  label: string;
  colSpan?: 1 | 2;
};

type InputFieldType = BaseFieldConfig & {
  type: "text" | "number" | "date";
  placeholder?: string;
};

type SelectFieldType = BaseFieldConfig & {
  type: "select";
  options: {
    label: string;
    value: string;
  }[];
};

type ToggleFieldType = BaseFieldConfig & {
  type: "toggle";
  activeText?: string;
  inactiveText?: string;
};

export type FilterFieldConfig =
  | InputFieldType
  | SelectFieldType
  | ToggleFieldType;

type GenericFiltersProps<T extends object> = {
  title?: string;

  filters: T;

  setFilters: React.Dispatch<React.SetStateAction<T>>;

  initialFilters: T;

  config: FilterFieldConfig[];
  onClose?: () => void;
  onChange?: (data: T) => void;
};

function GenericFilters<T extends object>({
  title = "Filters",
  filters,
  setFilters,
  initialFilters,
  config,
  onChange,
  onClose,
}: GenericFiltersProps<T>) {
  const [showFilters, setShowFilters] = useState(false);
  console.log("Filters:", filters);
  const [draftFilters, setDraftFilters] = useState<T>(filters);

  const updateFilter = <K extends keyof T>(key: K, value: T[K]) => {
    setDraftFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    onChange?.({ ...draftFilters, [key]: value } as T);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        leftIcon={<Filter size={16} />}
        onClick={() => {
          if (!showFilters) {
            setDraftFilters(filters);
          }

          setShowFilters((prev) => !prev);
        }}
      >
        Filters
      </Button>

      {showFilters && (
        <div className="absolute right-0 top-12 z-50 w-[320px] space-y-4 rounded-lg border bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{title}</h3>

            <button
              onClick={() => {
                onClose?.();
                setShowFilters(false);
              }}
              className="rounded-md p-1 hover:bg-gray-100 hover:cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {config.map((field) => {
              const value = draftFilters[field.key as keyof T];

              switch (field.type) {
                case "toggle":
                  return (
                    <button
                      key={field.key}
                      type="button"
                      onClick={() =>
                        updateFilter(
                          field.key as keyof T,
                          !(value as boolean) as T[keyof T],
                        )
                      }
                      className={`${
                        field.colSpan === 2 ? "col-span-2" : "col-span-1"
                      } flex h-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                        value
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {value
                        ? field.activeText || `${field.label} Enabled`
                        : field.inactiveText || `${field.label} Disabled`}
                    </button>
                  );

                case "select":
                  return (
                    <div
                      key={field.key}
                      className={
                        field.colSpan === 2 ? "col-span-2" : "col-span-1"
                      }
                    >
                      <Select
                        label={field.label}
                        value={String(value)}
                        onChange={(value) =>
                          updateFilter(
                            field.key as keyof T,
                            value as T[keyof T],
                          )
                        }
                        options={field.options}
                      />
                    </div>
                  );

                default:
                  return (
                    <div
                      key={field.key}
                      className={
                        field.colSpan === 2 ? "col-span-2" : "col-span-1"
                      }
                    >
                      <Input
                        label={field.label}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={
                          typeof value === "boolean"
                            ? ""
                            : (value as string | number)
                        }
                        onChange={(value) =>
                          updateFilter(
                            field.key as keyof T,
                            value as T[keyof T],
                          )
                        }
                      />
                    </div>
                  );
              }
            })}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setDraftFilters(initialFilters);
                onClose?.();
                setFilters(initialFilters);
              }}
            >
              Reset
            </Button>

            <Button
              onClick={() => {
                setFilters(draftFilters);

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

export default GenericFilters;
