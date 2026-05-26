import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import useFetch from "../hooks/useFetch.js";
import DoctorCard from "../components/common/DoctorCard.jsx";
import Spinner from "../components/common/Spinner.jsx";

const Doctors = () => {
  const [search, setSearch] = useState("");
  const { data, loading, error } = useFetch("/api/v1/doctors");

  const filtered = data?.doctors?.filter((doc) => {
    const name = `${doc.user?.firstName} ${doc.user?.lastName}`.toLowerCase();
    const spec = doc.specialization?.toLowerCase();
    const dept = doc.department?.name?.toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || spec?.includes(q) || dept?.includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="section-title">Find a Doctor</h1>
        <p className="section-subtitle">Browse our team of experienced specialists</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto mb-10">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, specialty, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {loading && <Spinner />}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && filtered?.length === 0 && (
        <p className="text-center text-gray-500">No doctors found matching your search.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered?.map((doc) => (
          <DoctorCard key={doc._id} doctor={doc} />
        ))}
      </div>
    </div>
  );
};

export default Doctors;
