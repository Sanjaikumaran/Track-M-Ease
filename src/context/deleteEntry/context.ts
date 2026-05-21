import { createContext } from "react";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: "primary" | "danger";
  onConfirm: () => Promise<void> | void;
};

type ConfirmContextType = {
  confirmDelete: (options: ConfirmOptions) => Promise<void>;
};

const DeleteConfirmationContext = createContext<ConfirmContextType | null>(
  null,
);

export { DeleteConfirmationContext };
export type { ConfirmOptions };
