import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiPlus, FiTrash2, FiCheckCircle, FiSearch,
  FiFilter, FiActivity, FiStar,
} from "react-icons/fi";
import { adminDoctorAPI } from "../services/adminApi.js";
import StatusBadge from "../components/common/StatusBadge.jsx";
import Spinner from "../components/common/Spinner.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ConfirmModal from "../components/common/ConfirmModal.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import toast from "react-hot-toast";

const Doctors = () => {
  const [doctors, setDoctors]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterVerified, setFilterVerified] = useState("all");
  const [confirmId, setConfirmId] = useState(null);
  const [confirmType, setConfirmType] = useState(null); // "verify" | "delete"

  const fetchDoctors = async () => {
    try {
      const { data } = await adminDoctorAPI.getAll();
      setDoctors(data.doctors ?? []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const filtered = useMemo(() => {
    return doctors.filter((doc) => {
      const name = `${doc.user?.firstName} ${doc.user?.lastName} ${doc.specialization} ${doc.department?.name}`.toLowerCase();
      const matchSearch = name.includes(search.toLowerCase());
      const matchFilter =
        filterVerified === "all" ||
        (filterVerified === "verified" && doc.isVerified) ||
        (filterVerified === "unverified" && !doc.isVerified);
      return matchSearch && matchFilter;
    });
  }, [doctors, search, filterVerified]);

  const openConfirm = (id, type) => { setConfirmId(id); setConfirmType(type); };
  const closeConfirm = () => { setConfirmId(null); setConfirmType(null); };

  const handleConfirm = async () => {
    try {
      if (confirmType === "verify") {
        await adminDoctorAPI.verify(confirmId);
        toast.success("Doctor verified successfully.");
      } else {
        await adminDoctorAPI.delete(confirmId);
        toast.success("Doctor removed.");
      }
      fetchDoctors();
    } catch (err) {
      toast.error(err.message);
    } finally {
      closeConfirm();
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Doctors"
        subtitle={`${doctors.length} registered doctors`}
        action={
          <Link to="/doctors/add" className="btn-primary">
            <FiPlus size={16} /> Add Doctor
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, specialization…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <FiFilter size={15} className="text-gray-400" />
          {["all", "verified", "unverified"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterVerified(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterVerified === f
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-primary-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiActivity}
            title="No doctors found"
            description={search ? "Try adjusting your search or filters." : "Add your first doctor to get started."}
            action={
              !search && (
                <Link to="/doctors/add" className="btn-primary">
                  <FiPlus size={15} /> Add Doctor
                </Link>
              )
            }
          />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-bg/50 border-b border-gray-100 dark:border-dark-border">
                <tr>
                  <th className="table-th">Doctor</th>
                  <th className="table-th">Specialization</th>
                  <th className="table-th">Department</th>
                  <th className="table-th">Experience</th>
                  <th className="table-th">Fee</th>
                  <th className="table-th">Rating</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                {filtered.map((doc) => (
                  <tr key={doc._id} className="table-row">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={doc.user?.avatar?.url || "/default-avatar.png"}
                            alt="Doctor"
                            className="w-10 h-10 rounded-xl object-cover bg-gray-100 dark:bg-dark-border"
                          />
                          {doc.isVerified && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <FiCheckCircle size={10} className="text-white" />
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            Dr. {doc.user?.firstName} {doc.user?.lastName}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-dark-muted">{doc.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-gray-600 dark:text-gray-400">{doc.specialization}</td>
                    <td className="table-td">
                      <span className="badge bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400">
                        {doc.department?.name ?? "—"}
                      </span>
                    </td>
                    <td className="table-td text-gray-600 dark:text-gray-400">
                      {doc.experience} yr{doc.experience !== 1 ? "s" : ""}
                    </td>
                    <td className="table-td font-semibold text-gray-900 dark:text-white">
                      ${doc.consultationFee}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1 text-amber-500">
                        <FiStar size={13} className="fill-amber-400 stroke-amber-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {doc.rating?.average?.toFixed(1) ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="table-td">
                      <StatusBadge label={doc.isVerified ? "Verified" : "Unverified"} />
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        {!doc.isVerified && (
                          <button
                            onClick={() => openConfirm(doc._id, "verify")}
                            className="btn-icon text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Verify doctor"
                          >
                            <FiCheckCircle size={17} />
                          </button>
                        )}
                        <button
                          onClick={() => openConfirm(doc._id, "delete")}
                          className="btn-icon text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Remove doctor"
                        >
                          <FiTrash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 dark:border-dark-border text-xs text-gray-400 dark:text-dark-muted">
            Showing {filtered.length} of {doctors.length} doctors
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmId}
        title={confirmType === "delete" ? "Remove Doctor" : "Verify Doctor"}
        message={
          confirmType === "delete"
            ? "This will permanently remove the doctor from the system. This action cannot be undone."
            : "Mark this doctor as verified? They will appear as a verified provider to patients."
        }
        confirmLabel={confirmType === "delete" ? "Remove" : "Verify"}
        danger={confirmType === "delete"}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
};

export default Doctors;
