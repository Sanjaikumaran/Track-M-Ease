import { createContext } from "react";

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: "primary" | "danger";
  onConfirm: () => Promise<void> | void;
};

export type ConfirmContextType = {
  confirmDelete: (options: ConfirmOptions) => Promise<void>;
};

export const DeleteConfirmationContext =
  createContext<ConfirmContextType | null>(null);
