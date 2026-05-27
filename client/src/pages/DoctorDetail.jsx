import { useParams, Link } from "react-router-dom";
import { FiStar, FiBriefcase, FiDollarSign } from "react-icons/fi";
import useFetch from "../hooks/useFetch.js";
import Spinner from "../components/common/Spinner.jsx";

const DoctorDetail = () => {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/api/v1/doctors/${id}`);
  const doctor = data?.doctor;

  if (loading) return <Spinner fullScreen />;
  if (error) return <p className="text-center text-red-500 py-20">{error}</p>;
  if (!doctor) return null;

  const { user, specialization, department, experience, bio, consultationFee, rating, qualifications } = doctor;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <img
            src={user?.avatar?.url || "/default-avatar.png"}
            alt={`Dr. ${user?.firstName}`}
            className="w-32 h-32 rounded-2xl object-cover border-4 border-primary-100"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dr. {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-primary-600 font-medium">{specialization}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{department?.name}</p>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <FiBriefcase size={14} className="text-primary-500" />
                {experience} years experience
              </span>
              <span className="flex items-center gap-1">
                <FiStar size={14} className="text-yellow-400 fill-yellow-400" />
                {rating?.average?.toFixed(1) || "N/A"} ({rating?.count || 0} reviews)
              </span>
              <span className="flex items-center gap-1">
                <FiDollarSign size={14} className="text-green-500" />
                ${consultationFee} per visit
              </span>
            </div>
          </div>

          <Link to={`/book-appointment?doctor=${doctor._id}`} className="btn-primary self-start">
            Book Appointment
          </Link>
        </div>
      </div>

      {bio && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">About</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{bio}</p>
        </div>
      )}

      {qualifications?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Qualifications</h2>
          <ul className="space-y-3">
            {qualifications.map((q, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold px-2 py-0.5 rounded text-xs mt-0.5">
                  {q.year}
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{q.degree}</p>
                  <p className="text-gray-500 dark:text-gray-400">{q.institution}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DoctorDetail;
