import React from "react";

type InputProps = {
  label?: string;

  error?: string;

  containerClassName?: string;

  inputClassName?: string;

  startIcon?: React.ReactNode;

  endIcon?: React.ReactNode;

  helperText?: string;

  onChange?: (value: string, e?: React.ChangeEvent<HTMLInputElement>) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">;

export default function Input({
  label,
  error,
  helperText,

  startIcon,
  endIcon,

  containerClassName = "",
  inputClassName = "",

  onChange,

  type = "text",

  disabled,

  ...props
}: InputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    onChange?.(value, e);
  }

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <div
        className={`flex items-center gap-2 rounded-sm border bg-white px-3 py-2 transition focus-within:ring-2 focus-within:ring-black hover:cursor-pointer ${disabled ? "bg-gray-100 opacity-70" : ""} ${error ? "border-red-500" : "border-gray-300"} ${inputClassName}`}
      >
        {startIcon && <div className="text-gray-500">{startIcon}</div>}

        <input
          {...props}
          type={type}
          disabled={disabled}
          onChange={handleChange}
          className={`w-full bg-transparent outline-none text-sm placeholder:text-gray-400
            ${type === "date" ? `cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70` : ""}`}
        />

        {endIcon && <div className="text-gray-500">{endIcon}</div>}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {!error && helperText && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
