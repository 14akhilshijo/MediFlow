import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch, FiFilter, FiStar, FiBriefcase,
  FiDollarSign, FiCalendar, FiUser,
} from "react-icons/fi";
import useFetch from "../hooks/useFetch.js";
import Spinner from "../components/common/Spinner.jsx";

const DoctorCard = ({ doctor }) => {
  const { _id, user, specialization, department, experience, consultationFee, rating, isAcceptingPatients } = doctor;

  return (
    <div className="card-hover group flex flex-col">
      { }
      <div className="relative mb-4">
        <img
          src={user?.avatar?.url || "/default-avatar.png"}
          alt={`Dr. ${user?.firstName}`}
          className="w-full h-44 object-cover rounded-xl border border-gray-100"
        />
        {!isAcceptingPatients && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Not Available
          </span>
        )}
        {isAcceptingPatients && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Available
          </span>
        )}
      </div>

      { }
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
          Dr. {user?.firstName} {user?.lastName}
        </h3>
        <p className="text-primary-600 text-sm font-medium">{specialization}</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{department?.name}</p>

        <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <FiBriefcase size={11} className="text-gray-400" />
            {experience} yrs exp
          </span>
          <span className="flex items-center gap-1">
            <FiStar size={11} className="text-yellow-400 fill-yellow-400" />
            {rating?.average?.toFixed(1) || "New"} ({rating?.count || 0})
          </span>
          <span className="flex items-center gap-1 font-semibold text-green-600">
            <FiDollarSign size={11} />
            {consultationFee}
          </span>
        </div>
      </div>

      { }
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Link
          to={`/doctors/${_id}`}
          className="flex-1 text-center text-xs font-medium text-primary-600 border border-primary-200 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 py-2 rounded-xl transition-all"
        >
          View Profile
        </Link>
        <Link
          to={`/book-appointment?doctor=${_id}`}
          className={`flex-1 text-center text-xs font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
            isAcceptingPatients
              ? "bg-primary-600 text-white hover:bg-primary-700"
              : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed pointer-events-none"
          }`}
        >
          <FiCalendar size={11} />
          Book
        </Link>
      </div>
    </div>
  );
};

const Doctors = () => {
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState("All");
  const { data, loading, error } = useFetch("/api/v1/doctors");

  const doctors = data?.doctors || [];

  const specializations = useMemo(() => {
    const specs = [...new Set(doctors.map((d) => d.specialization).filter(Boolean))];
    return ["All", ...specs.sort()];
  }, [doctors]);

  const filtered = useMemo(() => {
    return doctors.filter((doc) => {
      const name = `${doc.user?.firstName} ${doc.user?.lastName}`.toLowerCase();
      const spec = doc.specialization?.toLowerCase() || "";
      const dept = doc.department?.name?.toLowerCase() || "";
      const q = search.toLowerCase();
      const matchSearch = !q || name.includes(q) || spec.includes(q) || dept.includes(q);
      const matchSpec = specFilter === "All" || doc.specialization === specFilter;
      return matchSearch && matchSpec;
    });
  }, [doctors, search, specFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      { }
      <div className="text-center mb-10">
        <h1 className="section-title">Find a Doctor</h1>
        <p className="section-subtitle">
          Browse our team of {doctors.length} verified specialists
        </p>
      </div>

      { }
      <div className="relative max-w-md mx-auto mb-6">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search by name, specialty, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      { }
      {!loading && specializations.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {specializations.map((spec) => (
            <button
              key={spec}
              onClick={() => setSpecFilter(spec)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                specFilter === spec
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      )}

      { }
      {!loading && (
        <p className="text-sm text-gray-400 mb-4 text-center">
          Showing {filtered.length} doctor{filtered.length !== 1 ? "s" : ""}
          {specFilter !== "All" ? ` in ${specFilter}` : ""}
          {search ? ` matching "${search}"` : ""}
        </p>
      )}

      {loading && <Spinner />}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <FiUser size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">No doctors found.</p>
          <button
            onClick={() => { setSearch(""); setSpecFilter("All"); }}
            className="btn-outline mt-4 text-sm"
          >
            Clear Filters
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((doc) => (
          <DoctorCard key={doc._id} doctor={doc} />
        ))}
      </div>
    </div>
  );
};

export default Doctors;
