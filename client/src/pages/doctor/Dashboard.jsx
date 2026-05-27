import { Link } from "react-router-dom";
import {
  FiCalendar, FiClock, FiCheckCircle, FiXCircle,
  FiAlertCircle, FiUsers, FiStar, FiActivity,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import useFetch from "../../hooks/useFetch.js";
import AppointmentBadge from "../../components/common/AppointmentBadge.jsx";
import Spinner from "../../components/common/Spinner.jsx";

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      {sub && <p className="text-xs text-primary-500 font-medium mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const DoctorDashboard = () => {
  const { user } = useAuth();
  const { data: apptData, loading: apptLoading } = useFetch("/api/v1/appointments/doctor");
  const { data: profileData } = useFetch("/api/v1/doctors/my-profile");

  const appointments = apptData?.appointments || [];
  const doctor       = profileData?.doctor;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAppts = appointments.filter((a) => {
    const d = new Date(a.appointmentDate);
    return d >= today && d < tomorrow && (a.status === "Pending" || a.status === "Confirmed");
  });

  const upcoming  = appointments.filter(
    (a) => new Date(a.appointmentDate) >= today &&
           (a.status === "Pending" || a.status === "Confirmed")
  );
  const completed = appointments.filter((a) => a.status === "Completed").length;
  const pending   = appointments.filter((a) => a.status === "Pending").length;
  const total     = appointments.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Welcome Banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&size=80&background=0D8ABC&color=fff&rounded=true`}
            alt={user?.firstName}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-primary-100 dark:border-primary-900/40 shrink-0"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome, Dr. {user?.firstName} {user?.lastName} 👋
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {doctor?.specialization || "Loading profile…"}
            </p>
          </div>
        </div>
        {doctor && (
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-2 shrink-0">
            <FiStar size={16} className="text-amber-500" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              {doctor.rating?.average?.toFixed(1) || "0.0"}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-500">
              ({doctor.rating?.count || 0} reviews)
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiCalendar}    label="Total Appointments" value={total}     color="bg-primary-600" />
        <StatCard icon={FiAlertCircle} label="Pending"            value={pending}   color="bg-amber-500" />
        <StatCard icon={FiCheckCircle} label="Completed"          value={completed} color="bg-emerald-500" />
        <StatCard icon={FiActivity}    label="Today's Schedule"   value={todayAppts.length} color="bg-violet-500" sub="appointments today" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          to="/doctor/appointments"
          className="card flex items-center gap-4 hover:shadow-card-md transition-shadow group"
        >
          <div className="bg-primary-50 dark:bg-primary-900/30 p-3 rounded-xl">
            <FiCalendar size={22} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">
              My Appointments
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{upcoming.length} upcoming</p>
          </div>
        </Link>

        <Link
          to="/doctor/schedule"
          className="card flex items-center gap-4 hover:shadow-card-md transition-shadow group"
        >
          <div className="bg-violet-50 dark:bg-violet-900/20 p-3 rounded-xl">
            <FiClock size={22} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">
              My Schedule
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage availability</p>
          </div>
        </Link>

        <Link
          to="/doctor/profile"
          className="card flex items-center gap-4 hover:shadow-card-md transition-shadow group"
        >
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl">
            <FiUsers size={22} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">
              My Profile
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Update your info</p>
          </div>
        </Link>
      </div>

      {/* Today's Appointments */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiActivity size={18} className="text-primary-500" />
            Today's Appointments
          </h2>
          <Link to="/doctor/appointments" className="text-sm text-primary-600 hover:underline">
            View all
          </Link>
        </div>

        {apptLoading ? (
          <Spinner />
        ) : todayAppts.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <FiCalendar size={32} className="mx-auto mb-2" />
            <p className="text-sm">No appointments scheduled for today.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppts.map((appt) => (
              <div
                key={appt._id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                    <FiUsers size={16} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {appt.patient?.firstName} {appt.patient?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {appt.timeSlot} · {appt.type}
                    </p>
                  </div>
                </div>
                <AppointmentBadge status={appt.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiClock size={18} className="text-violet-500" />
            Upcoming Appointments
          </h2>
          <Link to="/doctor/appointments" className="text-sm text-primary-600 hover:underline">
            View all
          </Link>
        </div>

        {apptLoading ? (
          <Spinner />
        ) : upcoming.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <FiClock size={32} className="mx-auto mb-2" />
            <p className="text-sm">No upcoming appointments.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((appt) => (
              <div
                key={appt._id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                    <FiUsers size={16} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {appt.patient?.firstName} {appt.patient?.lastName}
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
                to="/doctor/appointments"
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

export default DoctorDashboard;
