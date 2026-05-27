import { Link } from "react-router-dom";
import {
  FiCalendar, FiClock, FiUser, FiPlusCircle,
  FiCheckCircle, FiXCircle, FiAlertCircle,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import useFetch from "../../hooks/useFetch.js";
import AppointmentBadge from "../../components/common/AppointmentBadge.jsx";
import Spinner from "../../components/common/Spinner.jsx";

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const { data, loading } = useFetch("/api/v1/appointments/my");

  const appointments = data?.appointments || [];
  const upcoming = appointments.filter(
    (a) => (a.status === "Pending" || a.status === "Confirmed") &&
            new Date(a.appointmentDate) >= new Date()
  );
  const completed  = appointments.filter((a) => a.status === "Completed").length;
  const cancelled  = appointments.filter((a) => a.status === "Cancelled").length;
  const pending    = appointments.filter((a) => a.status === "Pending").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your health overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiCalendar}     label="Total"     value={appointments.length} color="bg-primary-600" />
        <StatCard icon={FiAlertCircle}  label="Pending"   value={pending}             color="bg-amber-500" />
        <StatCard icon={FiCheckCircle}  label="Completed" value={completed}           color="bg-emerald-500" />
        <StatCard icon={FiXCircle}      label="Cancelled" value={cancelled}           color="bg-red-500" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          to="/book-appointment"
          className="card flex items-center gap-4 hover:shadow-card-md transition-shadow group"
        >
          <div className="bg-primary-50 dark:bg-primary-900/30 p-3 rounded-xl">
            <FiPlusCircle size={22} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">
              Book Appointment
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Schedule a new visit</p>
          </div>
        </Link>

        <Link
          to="/my-appointments"
          className="card flex items-center gap-4 hover:shadow-card-md transition-shadow group"
        >
          <div className="bg-accent-50 dark:bg-accent-900/20 p-3 rounded-xl">
            <FiCalendar size={22} className="text-accent-600 dark:text-accent-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">
              My Appointments
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{appointments.length} total</p>
          </div>
        </Link>

        <Link
          to="/profile"
          className="card flex items-center gap-4 hover:shadow-card-md transition-shadow group"
        >
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl">
            <FiUser size={22} className="text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">
              My Profile
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Update your info</p>
          </div>
        </Link>
      </div>

      {/* Upcoming Appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Appointments</h2>
          <Link to="/my-appointments" className="text-sm text-primary-600 hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : upcoming.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <FiClock size={32} className="mx-auto mb-2" />
            <p className="text-sm">No upcoming appointments.</p>
            <Link to="/book-appointment" className="btn-primary mt-4 inline-flex text-sm">
              <FiPlusCircle size={14} />
              Book Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((appt) => (
              <div
                key={appt._id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={appt.doctor?.user?.avatar?.url || "/default-avatar.png"}
                    alt="Doctor"
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric",
                      })}{" "}
                      · {appt.timeSlot}
                    </p>
                  </div>
                </div>
                <AppointmentBadge status={appt.status} />
              </div>
            ))}
            {upcoming.length > 5 && (
              <Link
                to="/my-appointments"
                className="block text-center text-sm text-primary-600 hover:underline pt-2"
              >
                +{upcoming.length - 5} more appointments
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
