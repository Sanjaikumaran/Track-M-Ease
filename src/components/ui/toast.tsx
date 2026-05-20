import { useCallback, useMemo, useState } from "react";

import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

import { ToastContext, type ToastItem } from "../../context/toast/context";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2) + Date.now().toString(36);

      setToasts((prev) => [
        ...prev,
        {
          ...toast,
          id,
          duration: toast.duration || 3000,
        },
      ]);

      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 3000);
    },
    [removeToast],
  );

  const value = useMemo(
    () => ({
      showToast,

      success: (message: string, title?: string) =>
        showToast({
          type: "success",
          message,
          title,
        }),

      error: (message: string, title?: string) =>
        showToast({
          type: "error",
          message,
          title,
        }),

      warning: (message: string, title?: string) =>
        showToast({
          type: "warning",
          message,
          title,
        }),

      info: (message: string, title?: string) =>
        showToast({
          type: "info",
          message,
          title,
        }),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: () => void;
}) {
  const config = {
    success: {
      icon: <CheckCircle2 size={20} />,
      className: "border-green-200 bg-green-50 text-green-800",
      iconClass: "text-green-600",
    },

    error: {
      icon: <AlertCircle size={20} />,
      className: "border-red-200 bg-red-50 text-red-800",
      iconClass: "text-red-600",
    },

    warning: {
      icon: <AlertTriangle size={20} />,
      className: "border-orange-200 bg-orange-50 text-orange-800",
      iconClass: "text-orange-600",
    },

    info: {
      icon: <Info size={20} />,
      className: "border-blue-200 bg-blue-50 text-blue-800",
      iconClass: "text-blue-600",
    },
  };

  const current = config[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg ${current.className}`}
    >
      <div className={current.iconClass}>{current.icon}</div>

      <div className="flex-1">
        {toast.title && (
          <h4 className="text-sm font-semibold">{toast.title}</h4>
        )}

        <p className="text-sm">{toast.message}</p>
      </div>

      <button onClick={onClose} className="rounded-md p-1 hover:bg-black/5">
        <X size={16} />
      </button>
    </div>
  );
}
