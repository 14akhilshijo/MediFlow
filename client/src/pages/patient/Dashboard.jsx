import { Link } from "react-router-dom";
import { FiCalendar, FiClock, FiUser, FiPlusCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import useFetch from "../../hooks/useFetch.js";
import AppointmentBadge from "../../components/common/AppointmentBadge.jsx";
import Spinner from "../../components/common/Spinner.jsx";

const Dashboard = () => {
  const { user } = useAuth();
  const { data, loading } = useFetch("/api/v1/appointments/my");

  const upcoming = data?.appointments?.filter(
    (a) => a.status === "Pending" || a.status === "Confirmed"
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-500 mt-1">Here's your health overview.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link to="/book-appointment" className="card flex items-center gap-4 hover:shadow-md transition-shadow group">
          <div className="bg-primary-50 p-3 rounded-xl">
            <FiPlusCircle size={22} className="text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-primary-600">Book Appointment</p>
            <p className="text-xs text-gray-500">Schedule a new visit</p>
          </div>
        </Link>

        <Link to="/my-appointments" className="card flex items-center gap-4 hover:shadow-md transition-shadow group">
          <div className="bg-accent-400/20 p-3 rounded-xl">
            <FiCalendar size={22} className="text-accent-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-primary-600">My Appointments</p>
            <p className="text-xs text-gray-500">{data?.count || 0} total</p>
          </div>
        </Link>

        <Link to="/profile" className="card flex items-center gap-4 hover:shadow-md transition-shadow group">
          <div className="bg-yellow-50 p-3 rounded-xl">
            <FiUser size={22} className="text-yellow-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-primary-600">My Profile</p>
            <p className="text-xs text-gray-500">Update your info</p>
          </div>
        </Link>
      </div>

      {/* Upcoming Appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
          <Link to="/my-appointments" className="text-sm text-primary-600 hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : upcoming?.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FiClock size={32} className="mx-auto mb-2" />
            <p>No upcoming appointments.</p>
            <Link to="/book-appointment" className="btn-primary mt-4 inline-block text-sm">
              Book Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming?.slice(0, 5).map((appt) => (
              <div key={appt._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <img
                    src={appt.doctor?.user?.avatar?.url || "/default-avatar.png"}
                    alt="Doctor"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(appt.appointmentDate).toLocaleDateString()} · {appt.timeSlot}
                    </p>
                  </div>
                </div>
                <AppointmentBadge status={appt.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
