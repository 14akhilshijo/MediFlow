import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar, FiClock, FiMapPin, FiVideo, FiPhone,
  FiPlusCircle, FiRefreshCw, FiAlertCircle,
} from "react-icons/fi";
import useFetch from "../../hooks/useFetch.js";
import AppointmentBadge from "../../components/common/AppointmentBadge.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import { appointmentAPI } from "../../services/api.js";
import toast from "react-hot-toast";

// ─── Constants ────────────────────────────────────────────────────────────────
const FILTERS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

const TYPE_ICONS = {
  "In-Person": <FiMapPin size={12} className="text-blue-500" />,
  "Video":     <FiVideo  size={12} className="text-purple-500" />,
  "Phone":     <FiPhone  size={12} className="text-green-500" />,
};

// ─── Appointment Card ─────────────────────────────────────────────────────────
const AppointmentCard = ({ appt, onCancel, cancelling }) => {
  const isPast = new Date(appt.appointmentDate) < new Date();
  const canCancel = (appt.status === "Pending" || appt.status === "Confirmed") && !isPast;

  return (
    <div className="card hover:shadow-card-md transition-all duration-200 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Doctor Avatar */}
        <img
          src={appt.doctor?.user?.avatar?.url || "/default-avatar.png"}
          alt="Doctor"
          className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-100 shrink-0"
        />

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName}
              </p>
              <p className="text-sm text-primary-600 font-medium">
                {appt.doctor?.specialization}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{appt.department?.name}</p>
            </div>
            <AppointmentBadge status={appt.status} />
          </div>

          {/* Details Row */}
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
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
            <span className="flex items-center gap-1.5 font-semibold text-green-600">
              ${appt.fee}
            </span>
          </div>

          {/* Reason */}
          {appt.reason && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 line-clamp-2">
              <span className="font-medium text-gray-600 dark:text-gray-300">Reason: </span>
              {appt.reason}
            </p>
          )}

          {/* Notes / Prescription (if completed) */}
          {appt.status === "Completed" && (appt.notes || appt.prescription) && (
            <div className="mt-3 space-y-2">
              {appt.notes && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2 text-xs text-blue-700 dark:text-blue-400">
                  <span className="font-semibold">Doctor's Notes: </span>
                  {appt.notes}
                </div>
              )}
              {appt.prescription && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2 text-xs text-green-700 dark:text-green-400">
                  <span className="font-semibold">Prescription: </span>
                  {appt.prescription}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {canCancel && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={() => onCancel(appt._id)}
            disabled={cancelling === appt._id}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium border border-red-200 hover:border-red-300 px-4 py-2 rounded-xl transition-all disabled:opacity-50"
          >
            {cancelling === appt._id ? (
              <>
                <span className="w-3 h-3 border border-red-300 border-t-red-500 rounded-full animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <FiAlertCircle size={12} />
                Cancel Appointment
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MyAppointments = () => {
  const { data, loading, error } = useFetch("/api/v1/appointments/my");
  const [filter, setFilter] = useState("All");
  const [cancelling, setCancelling] = useState(null);

  const appointments = data?.appointments || [];

  // Count per status for filter pills
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

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    setCancelling(id);
    try {
      await appointmentAPI.cancel(id);
      toast.success("Appointment cancelled.");
      window.location.reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {appointments.length} total appointment{appointments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link to="/book-appointment" className="btn-primary text-sm">
          <FiPlusCircle size={15} />
          Book New
        </Link>
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
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                filter === f
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              }`}
            >
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
          <button
            onClick={() => window.location.reload()}
            className="btn-outline mt-4 text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="card text-center py-14">
          <FiCalendar size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">
            {filter === "All"
              ? "You have no appointments yet."
              : `No ${filter.toLowerCase()} appointments.`}
          </p>
          {filter === "All" && (
            <Link to="/book-appointment" className="btn-primary mt-5 inline-flex text-sm">
              <FiPlusCircle size={15} />
              Book Your First Appointment
            </Link>
          )}
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((appt) => (
          <AppointmentCard
            key={appt._id}
            appt={appt}
            onCancel={handleCancel}
            cancelling={cancelling}
          />
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
