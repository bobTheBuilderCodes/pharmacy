import { useEffect } from "react";

const Modal = ({ title, isOpen, onClose, children }) => {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-800"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="button-muted" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
