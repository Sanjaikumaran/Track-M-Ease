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

export default function Select({
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
}: SelectProps) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onChange?.(e.target.value, e);
  }

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <select
        {...props}
        disabled={disabled}
        onChange={handleChange}
        className={`w-full rounded-sm border bg-white px-3 py-2 capitalize outline-none transition focus:ring-2 focus:ring-black hover:cursor-pointer ${disabled ? "bg-gray-100 opacity-70" : ""} ${error ? "border-red-500" : "border-gray-300"} ${selectClassName}`}
      >
        {placeholder && <option value="">{placeholder}</option>}

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="capitalize"
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
}
