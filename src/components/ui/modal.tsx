import React, { useEffect } from "react";
import Button, { type ButtonVariant } from "./button";

type ModalAction = {
  label: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
};

type ModalProps = {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  actions?: ModalAction[];
  closeOnBackdrop?: boolean;
  width?: string;
};

export default function Modal({
  open,
  title,
  children,
  onClose,
  actions = [],
  closeOnBackdrop = true,
  width = "max-w-lg",
}: ModalProps) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => {
        if (closeOnBackdrop) {
          onClose();
        }
      }}
    >
      <div
        className={`w-full ${width} rounded-sm bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>

          <Button onClick={onClose} variant="ghost">
            ✕
          </Button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>

        {actions.length > 0 && (
          <div className="flex items-center justify-end gap-3 border-t px-5 py-4">
            {actions.map((action, index) => (
              <Button
                key={index}
                type={action.type || "button"}
                disabled={action.disabled || action.loading}
                loading={action.loading}
                onClick={() => {
                  action.onClick?.();
                }}
                variant={action.variant || "primary"}
                className={action.className}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
