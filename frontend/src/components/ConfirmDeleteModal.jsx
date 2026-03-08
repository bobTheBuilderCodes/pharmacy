import Modal from "./Modal";

const ConfirmDeleteModal = ({
  isOpen,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item?",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel
}) => (
  <Modal title={title} isOpen={isOpen} onClose={onCancel}>
    <div className="grid gap-4">
      <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
      <div className="flex items-center justify-end gap-2">
        <button className="button-muted" type="button" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </button>
        <button className="button" type="button" onClick={onConfirm} disabled={loading}>
          {loading ? "Deleting..." : confirmLabel}
        </button>
      </div>
    </div>
  </Modal>
);

export default ConfirmDeleteModal;
