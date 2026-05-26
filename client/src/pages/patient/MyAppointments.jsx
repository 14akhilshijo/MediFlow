import { useState } from "react";
import useFetch from "../../hooks/useFetch.js";
import AppointmentBadge from "../../components/common/AppointmentBadge.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import { appointmentAPI } from "../../services/api.js";
import toast from "react-hot-toast";

const FILTERS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

const MyAppointments = () => {
  const { data, loading, error } = useFetch("/api/v1/appointments/my");
  const [filter, setFilter] = useState("All");
  const [cancelling, setCancelling] = useState(null);

  const appointments = data?.appointments || [];
  const filtered =
    filter === "All" ? appointments : appointments.filter((a) => a.status === filter);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <Spinner />}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && filtered.length === 0 && (
        <p className="text-center text-gray-400 py-12">No appointments found.</p>
      )}

      <div className="space-y-4">
        {filtered.map((appt) => (
          <div key={appt._id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={appt.doctor?.user?.avatar?.url || "/default-avatar.png"}
                alt="Doctor"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">
                  Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName}
                </p>
                <p className="text-sm text-gray-500">{appt.department?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                    weekday: "short", year: "numeric", month: "short", day: "numeric",
                  })} · {appt.timeSlot}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AppointmentBadge status={appt.status} />
              {(appt.status === "Pending" || appt.status === "Confirmed") && (
                <button
                  onClick={() => handleCancel(appt._id)}
                  disabled={cancelling === appt._id}
                  className="text-xs text-red-500 hover:text-red-600 font-medium border border-red-200 px-3 py-1 rounded-full"
                >
                  {cancelling === appt._id ? "Cancelling..." : "Cancel"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
