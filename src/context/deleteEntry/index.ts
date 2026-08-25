import { useContext } from "react";
import { DeleteConfirmationContext } from "./context";

const useDeleteConfirmation = () => {
  const ctx = useContext(DeleteConfirmationContext);
  if (!ctx)
    throw new Error(
      "useDeleteConfirmation must be used within DeleteConfirmationProvider",
    );
  return ctx;
};

export { useDeleteConfirmation };
