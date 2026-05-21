import { useCallback, useRef, useState } from "react";
import ConfirmationModal from "./ui/confirmation";
import {
  DeleteConfirmationContext,
  type ConfirmOptions,
} from "../context/deleteEntry/context";

const DeleteConfirmationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const resolverRef = useRef<(() => void) | null>(null);

  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);

  const confirmDelete = useCallback((options: ConfirmOptions) => {
    setOptions(options);
    setOpen(true);

    return new Promise<void>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleConfirm = async () => {
    if (!options) return;

    try {
      setLoading(true);
      await options.onConfirm();

      resolverRef.current?.();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <DeleteConfirmationContext.Provider value={{ confirmDelete }}>
      {children}

      <ConfirmationModal
        open={open}
        title={options?.title || ""}
        message={options?.message || ""}
        confirmText={options?.confirmText || "Delete"}
        confirmVariant={options?.confirmVariant || "danger"}
        loading={loading}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </DeleteConfirmationContext.Provider>
  );
};

export { DeleteConfirmationProvider };
