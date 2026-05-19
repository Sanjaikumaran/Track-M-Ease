// components/ui/confirmation-modal.tsx

import Modal from "./modal";
// import Button from "./ui/button";

interface ConfirmationModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  open,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      actions={[
        {
          label: cancelText,
          variant: "secondary",
          disabled: loading,
          onClick: onCancel,
        },
        {
          label: loading ? "Please wait..." : confirmText,
          onClick: onConfirm,
          disabled: loading,
          className:
            confirmVariant === "danger"
              ? "!bg-red-600 hover:!bg-red-700 !text-white"
              : "",
        },
      ]}
    >
      <div className="space-y-3 p-1">
        <p className="text-sm leading-relaxed text-gray-600">{message}</p>

        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs text-orange-700">
          This action may not be reversible.
        </div>
      </div>
    </Modal>
  );
}
