import React from "react";

type TextareaProps = {
  label?: string;

  error?: string;

  helperText?: string;

  containerClassName?: string;

  textareaClassName?: string;

  onChange?: (
    value: string,
    e?: React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange">;

export default function Textarea({
  label,
  error,
  helperText,

  containerClassName = "",
  textareaClassName = "",

  onChange,

  disabled,

  rows = 4,

  ...props
}: TextareaProps) {
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange?.(e.target.value, e);
  }

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {/* LABEL */}

      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      {/* TEXTAREA */}

      <textarea
        {...props}
        rows={rows}
        disabled={disabled}
        onChange={handleChange}
        className={`
          w-full
          rounded-sm
          border
          bg-white
          px-3
          py-2
          outline-none
          transition
          resize-none
          focus:ring-2
          focus:ring-black

          ${disabled ? "bg-gray-100 opacity-70" : ""}

          ${error ? "border-red-500" : "border-gray-300"}

          ${textareaClassName}
        `}
      />

      {/* ERROR */}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* HELPER */}

      {!error && helperText && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
