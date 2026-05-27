import { useState } from "react";
import {
  FiCalendar, FiClock, FiUser, FiPhone, FiMail,
  FiMapPin, FiVideo, FiRefreshCw, FiCheck, FiX,
  FiAlertCircle, FiEdit3,
} from "react-icons/fi";
import useFetch from "../../hooks/useFetch.js";
import AppointmentBadge from "../../components/common/AppointmentBadge.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import api from "../../services/api.js";
import toast from "react-hot-toast";

// ─── Constants ────────────────────────────────────────────────────────────────
const FILTERS = ["All", "Pending", "Confirmed", "Completed", "Cancelled", "No-Show"];

const TYPE_ICONS = {
  "In-Person": <FiMapPin size={12} className="text-blue-500" />,
  "Video":     <FiVideo  size={12} className="text-purple-500" />,
  "Phone":     <FiPhone  size={12} className="text-green-500" />,
};

// ─── Status Update Modal ──────────────────────────────────────────────────────
const UpdateModal = ({ appt, onClose, onSave }) => {
  const [status, setStatus]           = useState(appt.status);
  const [notes, setNotes]             = useState(appt.notes || "");
  const [prescription, setPrescription] = useState(appt.prescription || "");
  const [saving, setSaving]           = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/appointments/${appt._id}/status`, { status, notes, prescription });
      toast.success("Appointment updated.");
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Update Appointment</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <FiX size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Patient info */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-sm">
            <p className="font-medium text-gray-900 dark:text-white">
              {appt.patient?.firstName} {appt.patient?.lastName}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
              {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric",
              })} · {appt.timeSlot}
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-field"
            >
              {["Pending", "Confirmed", "Completed", "Cancelled", "No-Show"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Doctor's Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Clinical notes, diagnosis, observations…"
              className="input-field resize-none"
            />
          </div>

          {/* Prescription */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prescription
            </label>
            <textarea
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              rows={3}
              placeholder="Medications, dosage, instructions…"
              className="input-field resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Appointment Card ─────────────────────────────────────────────────────────
const AppointmentCard = ({ appt, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const isPast = new Date(appt.appointmentDate) < new Date();
  const canUpdate = appt.status !== "Cancelled";

  return (
    <>
      <div className="card hover:shadow-card-md transition-all duration-200">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Patient Avatar placeholder */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0">
            <FiUser size={22} className="text-white" />
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {appt.patient?.firstName} {appt.patient?.lastName}
                </p>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {appt.patient?.email && (
                    <span className="flex items-center gap-1">
                      <FiMail size={11} /> {appt.patient.email}
                    </span>
                  )}
                  {appt.patient?.phone && (
                    <span className="flex items-center gap-1">
                      <FiPhone size={11} /> {appt.patient.phone}
                    </span>
                  )}
                </div>
              </div>
              <AppointmentBadge status={appt.status} />
            </div>

            {/* Details Row */}
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <FiCalendar size={12} className="text-primary-400" />
                {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                  weekday: "short", month: "short", day: "numeric", year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <FiClock size={12} className="text-primary-400" />
                {appt.timeSlot}
              </span>
              <span className="flex items-center gap-1.5">
                {TYPE_ICONS[appt.type]}
                {appt.type}
              </span>
              {isPast && appt.status !== "Completed" && appt.status !== "Cancelled" && (
                <span className="flex items-center gap-1 text-amber-500 font-medium">
                  <FiAlertCircle size={11} /> Past
                </span>
              )}
            </div>

            {/* Reason */}
            {appt.reason && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 line-clamp-2">
                <span className="font-medium text-gray-600 dark:text-gray-300">Reason: </span>
                {appt.reason}
              </p>
            )}

            {/* Notes / Prescription */}
            {(appt.notes || appt.prescription) && (
              <div className="mt-3 space-y-2">
                {appt.notes && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2 text-xs text-blue-700 dark:text-blue-400">
                    <span className="font-semibold">Notes: </span>{appt.notes}
                  </div>
                )}
                {appt.prescription && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2 text-xs text-green-700 dark:text-green-400">
                    <span className="font-semibold">Prescription: </span>{appt.prescription}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {canUpdate && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
            {appt.status === "Pending" && (
              <button
                onClick={async () => {
                  try {
                    await api.patch(`/appointments/${appt._id}/status`, { status: "Confirmed" });
                    toast.success("Appointment confirmed.");
                    onUpdate();
                  } catch (err) { toast.error(err.message); }
                }}
                className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium border border-emerald-200 hover:border-emerald-300 px-4 py-2 rounded-xl transition-all"
              >
                <FiCheck size={12} /> Confirm
              </button>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium border border-primary-200 hover:border-primary-300 px-4 py-2 rounded-xl transition-all"
            >
              <FiEdit3 size={12} /> Update
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <UpdateModal
          appt={appt}
          onClose={() => setShowModal(false)}
          onSave={onUpdate}
        />
      )}
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const DoctorAppointments = () => {
  const { data, loading, error } = useFetch("/api/v1/appointments/doctor");
  const [filter, setFilter]     = useState("All");
  const [refresh, setRefresh]   = useState(0);

  // Re-trigger useFetch by changing key via page reload workaround
  const handleUpdate = () => window.location.reload();

  const appointments = data?.appointments || [];

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "All"
      ? appointments.length
      : appointments.filter((a) => a.status === f).length;
    return acc;
  }, {});

  const filtered =
    filter === "All"
      ? appointments
      : appointments.filter((a) => a.status === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
          {appointments.length} total appointment{appointments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600"
            }`}
          >
            {f}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
              filter === f
                ? "bg-white/20 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            }`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && <Spinner />}

      {error && (
        <div className="card text-center py-10">
          <FiRefreshCw size={24} className="mx-auto mb-2 text-red-400" />
          <p className="text-red-500 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-outline mt-4 text-sm">
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="card text-center py-14">
          <FiCalendar size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">
            {filter === "All" ? "No appointments yet." : `No ${filter.toLowerCase()} appointments.`}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((appt) => (
          <AppointmentCard key={appt._id} appt={appt} onUpdate={handleUpdate} />
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;
