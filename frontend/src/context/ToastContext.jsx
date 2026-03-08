import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

const toastStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100",
  error: "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/40 dark:text-red-100",
  info: "border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
};

const ToastViewport = ({ toasts, dismissToast }) => (
  <div className="pointer-events-none fixed right-4 top-4 z-[100] grid w-full max-w-sm gap-2">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`pointer-events-auto rounded-lg border px-3 py-2 text-sm shadow-lg ${toastStyles[toast.type] || toastStyles.info}`}
      >
        <div className="flex items-start justify-between gap-2">
          <p>{toast.message}</p>
          <button className="text-xs opacity-70 hover:opacity-100" onClick={() => dismissToast(toast.id)} type="button">
            Close
          </button>
        </div>
      </div>
    ))}
  </div>
);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info") => {
    const id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismissToast(id), 3500);
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
