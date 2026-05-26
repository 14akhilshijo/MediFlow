import { FiAlertTriangle } from "react-icons/fi";

const ConfirmModal = ({ open, title, message, confirmLabel = "Confirm", danger = false, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${danger ? "bg-red-100 dark:bg-red-900/30" : "bg-yellow-100 dark:bg-yellow-900/30"}`}>
            <FiAlertTriangle size={20} className={danger ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400"} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-dark-muted">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button
            onClick={onConfirm}
            className={danger ? "btn-danger" : "btn-primary"}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
