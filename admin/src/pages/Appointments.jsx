import { useEffect, useState, useMemo } from "react";
import { FiSearch, FiCalendar, FiFilter, FiChevronDown } from "react-icons/fi";
import { adminAppointmentAPI } from "../services/adminApi.js";
import StatusBadge from "../components/common/StatusBadge.jsx";
import Spinner from "../components/common/Spinner.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["Pending", "Confirmed", "Completed", "Cancelled", "No-Show"];
const FILTER_OPTIONS = ["All", ...STATUS_OPTIONS];

const TYPE_ICONS = {
  "In-Person": "🏥",
  "Video":     "📹",
  "Phone":     "📞",
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [updatingId, setUpdatingId]     = useState(null);

  const fetchAppointments = async () => {
    try {
      const { data } = await adminAppointmentAPI.getAll();
      setAppointments(data.appointments ?? []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const filtered = useMemo(() => {
    return appointments.filter((appt) => {
      const text = `${appt.patient?.firstName} ${appt.patient?.lastName} ${appt.doctor?.user?.firstName} ${appt.doctor?.user?.lastName}`.toLowerCase();
      const matchSearch = text.includes(search.toLowerCase());
      const matchStatus = filterStatus === "All" || appt.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [appointments, search, filterStatus]);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await adminAppointmentAPI.updateStatus(id, { status });
      toast.success("Status updated.");
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status } : a))
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Status counts for filter pills
  const counts = useMemo(() => {
    const c = { All: appointments.length };
    STATUS_OPTIONS.forEach((s) => {
      c[s] = appointments.filter((a) => a.status === s).length;
    });
    return c;
  }, [appointments]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Appointments"
        subtitle={`${appointments.length} total appointments`}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search patient or doctor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FiFilter size={15} className="text-gray-400 shrink-0" />
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterStatus === f
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-primary-300"
              }`}
            >
              {f}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                filterStatus === f ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-dark-muted"
              }`}>
                {counts[f] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiCalendar}
            title="No appointments found"
            description={search || filterStatus !== "All" ? "Try adjusting your search or filters." : "No appointments have been booked yet."}
          />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-bg/50 border-b border-gray-100 dark:border-dark-border">
                <tr>
                  <th className="table-th">Patient</th>
                  <th className="table-th">Doctor</th>
                  <th className="table-th">Date & Time</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Fee</th>
                  <th className="table-th">Payment</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                {filtered.map((appt) => (
                  <tr key={appt._id} className="table-row">
                    <td className="table-td">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {appt.patient?.firstName} {appt.patient?.lastName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-dark-muted">{appt.patient?.phone}</p>
                    </td>
                    <td className="table-td">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-dark-muted">{appt.department?.name}</p>
                    </td>
                    <td className="table-td">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-dark-muted">{appt.timeSlot}</p>
                    </td>
                    <td className="table-td">
                      <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <span>{TYPE_ICONS[appt.type] ?? "📋"}</span>
                        {appt.type}
                      </span>
                    </td>
                    <td className="table-td font-semibold text-gray-900 dark:text-white">
                      ${appt.fee}
                    </td>
                    <td className="table-td">
                      <StatusBadge label={appt.paymentStatus} />
                    </td>
                    <td className="table-td">
                      <StatusBadge label={appt.status} />
                    </td>
                    <td className="table-td">
                      <div className="relative">
                        <select
                          value={appt.status}
                          disabled={updatingId === appt._id}
                          onChange={(e) => handleStatusChange(appt._id, e.target.value)}
                          className="appearance-none text-xs border border-gray-200 dark:border-dark-border rounded-lg pl-3 pr-7 py-1.5 bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <FiChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 dark:border-dark-border text-xs text-gray-400 dark:text-dark-muted">
            Showing {filtered.length} of {appointments.length} appointments
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
