import useFetch from "../hooks/useFetch.js";
import Spinner from "../components/common/Spinner.jsx";

const Departments = () => {
  const { data, loading, error } = useFetch("/api/v1/departments");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="section-title">Our Departments</h1>
        <p className="section-subtitle">Specialized care across all medical fields</p>
      </div>

      {loading && <Spinner />}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.departments?.map((dept) => (
          <div key={dept._id} className="card hover:shadow-md transition-shadow text-center">
            <div className="text-4xl mb-3">{dept.icon || "🏥"}</div>
            <h3 className="font-semibold text-gray-900 mb-2">{dept.name}</h3>
            <p className="text-sm text-gray-500">{dept.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Departments;
