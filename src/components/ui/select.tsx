import React from "react";

type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  label?: string;
  error?: string;
  helperText?: string;
  options: Option[];
  containerClassName?: string;
  selectClassName?: string;
  placeholder?: string;
  onChange?: (value: string, e?: React.ChangeEvent<HTMLSelectElement>) => void;
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange">;

const Select = ({
  label,
  error,
  helperText,
  options,
  placeholder,
  containerClassName = "",
  selectClassName = "",
  onChange,
  disabled,
  ...props
}: SelectProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value, e);
  };

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <select
        {...props}
        disabled={disabled}
        onChange={handleChange}
        value={props.value ?? ""}
        className={`w-full rounded-sm border bg-white px-3 py-2 capitalize outline-none transition focus:ring-2 focus:ring-black hover:cursor-pointer ${
          disabled ? "bg-gray-100 opacity-70" : ""
        } ${error ? "border-red-500" : "border-gray-300"} ${selectClassName}`}
      >
        <option value="" disabled hidden defaultValue={""}>
          {placeholder || "Select"}
        </option>

        {options?.length === 0
          ? "No options"
          : options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="capitalize hover:cursor-pointer "
              >
                {option.label}
              </option>
            ))}
      </select>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {!error && helperText && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Select;
export type { Option };
