import { useState } from "react";
import {
  FiX, FiCalendar, FiClock, FiUser, FiPhone,
  FiMail, FiMapPin, FiVideo, FiCheck, FiCheckCircle,
  FiAlertCircle, FiFileText,
} from "react-icons/fi";
import StatusBadge from "../common/StatusBadge.jsx";

const TYPE_ICONS = {
  "In-Person": <FiMapPin  size={14} className="text-blue-500" />,
  "Video":     <FiVideo   size={14} className="text-purple-500" />,
  "Phone":     <FiPhone   size={14} className="text-green-500" />,
};

const Field = ({ label, value, className = "" }) => (
  <div>
    <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">{label}</p>
    <p className={`text-sm font-medium text-gray-800 dark:text-gray-200 ${className}`}>
      {value || "—"}
    </p>
  </div>
);

const AppointmentDetailModal = ({ appointment: appt, onClose, onStatusChange, updating }) => {
  const [notes, setNotes]               = useState(appt.notes || "");
  const [prescription, setPrescription] = useState(appt.prescription || "");
  const [activeTab, setActiveTab]       = useState("details");

  if (!appt) return null;

  const handleUpdate = (status) => {
    onStatusChange(appt._id, status, {
      notes:        notes.trim() || undefined,
      prescription: prescription.trim() || undefined,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        { }
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Appointment Details
            </h2>
            <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">
              ID: {appt._id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge label={appt.status} />
            <button onClick={onClose} className="btn-icon">
              <FiX size={18} />
            </button>
          </div>
        </div>

        { }
        <div className="flex gap-1 mb-5 bg-gray-100 dark:bg-dark-border p-1 rounded-xl">
          {["details", "notes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? "bg-white dark:bg-dark-surface text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-dark-muted hover:text-gray-700"
              }`}
            >
              {tab === "details" ? "Appointment Details" : "Notes & Prescription"}
            </button>
          ))}
        </div>

        { }
        {activeTab === "details" && (
          <div className="space-y-5">
            { }
            <div className="bg-gray-50 dark:bg-dark-bg/50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider mb-3">
                Patient
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Name"
                  value={`${appt.patient?.firstName} ${appt.patient?.lastName}`}
                />
                <Field label="Phone" value={appt.patient?.phone} />
                <Field label="Email" value={appt.patient?.email} />
              </div>
            </div>

            { }
            <div className="bg-gray-50 dark:bg-dark-bg/50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider mb-3">
                Doctor
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Name"
                  value={`Dr. ${appt.doctor?.user?.firstName} ${appt.doctor?.user?.lastName}`}
                />
                <Field label="Department" value={appt.department?.name} />
              </div>
            </div>

            { }
            <div className="bg-gray-50 dark:bg-dark-bg/50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider mb-3">
                Appointment
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Date"
                  value={new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                    weekday: "long", month: "long", day: "numeric", year: "numeric",
                  })}
                />
                <Field label="Time" value={appt.timeSlot} />
                <div>
                  <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">Type</p>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-gray-800 dark:text-gray-200">
                    {TYPE_ICONS[appt.type]}
                    {appt.type}
                  </span>
                </div>
                <Field
                  label="Fee"
                  value={`$${appt.fee}`}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
              {appt.reason && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-border">
                  <p className="text-xs text-gray-400 dark:text-dark-muted mb-1">
                    Reason for Visit
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {appt.reason}
                  </p>
                </div>
              )}
            </div>

            { }
            <p className="text-xs text-gray-400 dark:text-dark-muted text-right">
              Booked on{" "}
              {new Date(appt.createdAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })}
            </p>
          </div>
        )}

        { }
        {activeTab === "notes" && (
          <div className="space-y-4">
            <div>
              <label className="input-label flex items-center gap-1.5">
                <FiFileText size={13} />
                Doctor's Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                maxLength={1000}
                className="input-field resize-none"
                placeholder="Add clinical notes about this appointment..."
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{notes.length}/1000</p>
            </div>
            <div>
              <label className="input-label flex items-center gap-1.5">
                <FiFileText size={13} />
                Prescription
              </label>
              <textarea
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                rows={4}
                maxLength={2000}
                className="input-field resize-none"
                placeholder="Add prescription details..."
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{prescription.length}/2000</p>
            </div>

            {/* Existing notes/prescription display */}
            {appt.notes && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
                <span className="font-semibold">Saved Notes: </span>{appt.notes}
              </div>
            )}
            {appt.prescription && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-xs text-green-700 dark:text-green-300">
                <span className="font-semibold">Saved Prescription: </span>{appt.prescription}
              </div>
            )}
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-gray-100 dark:border-dark-border">
          {appt.status === "Pending" && (
            <>
              <button
                onClick={() => handleUpdate("Confirmed")}
                disabled={updating}
                className="btn-primary flex items-center gap-1.5 text-sm"
              >
                <FiCheck size={14} />
                {updating ? "Updating..." : "Approve"}
              </button>
              <button
                onClick={() => handleUpdate("Cancelled")}
                disabled={updating}
                className="btn-danger flex items-center gap-1.5 text-sm"
              >
                <FiX size={14} />
                Reject
              </button>
            </>
          )}
          {appt.status === "Confirmed" && (
            <>
              <button
                onClick={() => handleUpdate("Completed")}
                disabled={updating}
                className="btn-primary flex items-center gap-1.5 text-sm"
              >
                <FiCheckCircle size={14} />
                {updating ? "Updating..." : "Mark Completed"}
              </button>
              <button
                onClick={() => handleUpdate("No-Show")}
                disabled={updating}
                className="btn-secondary flex items-center gap-1.5 text-sm"
              >
                <FiAlertCircle size={14} />
                No-Show
              </button>
              <button
                onClick={() => handleUpdate("Cancelled")}
                disabled={updating}
                className="btn-danger flex items-center gap-1.5 text-sm"
              >
                <FiX size={14} />
                Cancel
              </button>
            </>
          )}
          {activeTab === "notes" && (appt.status === "Confirmed" || appt.status === "Completed") && (
            <button
              onClick={() => handleUpdate(appt.status)}
              disabled={updating}
              className="btn-secondary flex items-center gap-1.5 text-sm ml-auto"
            >
              <FiFileText size={14} />
              {updating ? "Saving..." : "Save Notes"}
            </button>
          )}
          <button onClick={onClose} className="btn-secondary text-sm ml-auto">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
