import { Link } from "react-router-dom";
import { FiStar, FiBriefcase } from "react-icons/fi";

const DoctorCard = ({ doctor }) => {
  const { _id, user, specialization, department, experience, rating, consultationFee } = doctor;

  return (
    <div className="card hover:shadow-md transition-shadow group">
      {/* Avatar */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src={user?.avatar?.url || "/default-avatar.png"}
          alt={`Dr. ${user?.firstName} ${user?.lastName}`}
          className="w-16 h-16 rounded-full object-cover border-2 border-primary-100"
        />
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
            Dr. {user?.firstName} {user?.lastName}
          </h3>
          <p className="text-sm text-primary-600 font-medium">{specialization}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{department?.name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <span className="flex items-center gap-1">
          <FiBriefcase size={14} className="text-primary-500" />
          {experience} yrs exp
        </span>
        <span className="flex items-center gap-1">
          <FiStar size={14} className="text-yellow-400 fill-yellow-400" />
          {rating?.average?.toFixed(1) || "N/A"} ({rating?.count || 0})
        </span>
      </div>

      {/* Fee & CTA */}
      <div className="flex items-center justify-between">
        <span className="text-primary-700 dark:text-primary-400 font-semibold">
          ${consultationFee} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">/ visit</span>
        </span>
        <Link
          to={`/doctors/${_id}`}
          className="btn-primary text-sm py-1.5 px-4"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;
