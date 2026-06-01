import { Loader } from "lucide-react";
import React from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "outline"
  | "ghost"
  | "link";

type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "secondary":
        return `bg-gray-200 text-black hover:bg-gray-300`;
      case "danger":
        return `bg-red-500 text-white hover:bg-red-600`;
      case "success":
        return `bg-green-500 text-white hover:bg-green-600`;
      case "outline":
        return `border border-gray-300 bg-white text-black hover:bg-gray-100`;
      case "ghost":
        return `bg-transparent text-black hover:bg-gray-100`;
      case "link":
        return `text-blue-500 hover:text-blue-700`;
      default:
        return `bg-black text-white hover:bg-gray-800`;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return `px-3 py-1.5 text-sm`;
      case "lg":
        return `px-6 py-3 text-base`;
      default:
        return `px-4 py-2 text-sm`;
    }
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={` inline-flex items-center justify-center gap-2 rounded-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer ${fullWidth ? "w-full" : ""} ${getVariantClasses()} ${getSizeClasses()} ${className}`}
    >
      {!loading && leftIcon}

      {loading && <Loader className="h-4 w-4 animate-spin " />}

      <span>{loading ? "Loading..." : children}</span>

      {!loading && rightIcon}
    </button>
  );
};

export default Button;
export type { ButtonVariant };
