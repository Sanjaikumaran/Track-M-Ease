import { createContext } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ToastContextType {
  showToast: (toast: Omit<ToastItem, "id">) => void;

  success: (message: string, title?: string) => void;

  error: (message: string, title?: string) => void;

  warning: (message: string, title?: string) => void;

  info: (message: string, title?: string) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);
