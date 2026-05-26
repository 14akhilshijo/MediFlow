import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiUserX, FiSearch, FiUsers, FiFilter } from "react-icons/fi";
import { adminUserAPI } from "../services/adminApi.js";
import StatusBadge from "../components/common/StatusBadge.jsx";
import Spinner from "../components/common/Spinner.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ConfirmModal from "../components/common/ConfirmModal.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import toast from "react-hot-toast";

const Users = () => {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [confirmId, setConfirmId]   = useState(null);
  const [confirmType, setConfirmType] = useState(null);

  const fetchUsers = async () => {
    try {
      const { data } = await adminUserAPI.getAll();
      setUsers(data.users ?? []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const text = `${u.firstName} ${u.lastName} ${u.email} ${u.phone}`.toLowerCase();
      const matchSearch = text.includes(search.toLowerCase());
      const matchRole = filterRole === "All" || u.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [users, search, filterRole]);

  const openConfirm = (id, type) => { setConfirmId(id); setConfirmType(type); };
  const closeConfirm = () => { setConfirmId(null); setConfirmType(null); };

  const handleConfirm = async () => {
    try {
      if (confirmType === "deactivate") {
        await adminUserAPI.deactivate(confirmId);
        toast.success("User deactivated.");
      } else {
        await adminUserAPI.delete(confirmId);
        toast.success("User deleted.");
      }
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      closeConfirm();
    }
  };

  const roleCounts = useMemo(() => {
    const c = { All: users.length };
    ["Patient", "Doctor", "Admin"].forEach((r) => {
      c[r] = users.filter((u) => u.role === r).length;
    });
    return c;
  }, [users]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Patients"
        subtitle={`${users.filter((u) => u.role === "Patient").length} registered patients`}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <FiFilter size={15} className="text-gray-400" />
          {["All", "Patient", "Doctor", "Admin"].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterRole === r
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-primary-300"
              }`}
            >
              {r}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                filterRole === r ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-dark-muted"
              }`}>
                {roleCounts[r] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiUsers}
            title="No users found"
            description={search ? "Try adjusting your search or filters." : "No users registered yet."}
          />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-bg/50 border-b border-gray-100 dark:border-dark-border">
                <tr>
                  <th className="table-th">User</th>
                  <th className="table-th">Phone</th>
                  <th className="table-th">Gender</th>
                  <th className="table-th">Role</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Joined</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                {filtered.map((user) => (
                  <tr key={user._id} className="table-row">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        {user.avatar?.url ? (
                          <img
                            src={user.avatar.url}
                            alt={user.firstName}
                            className="w-9 h-9 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-dark-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-gray-600 dark:text-gray-400">{user.phone}</td>
                    <td className="table-td text-gray-600 dark:text-gray-400">{user.gender}</td>
                    <td className="table-td">
                      <span className={`badge ${
                        user.role === "Admin"
                          ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                          : user.role === "Doctor"
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                          : "bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="table-td">
                      <StatusBadge label={user.isActive ? "Active" : "Inactive"} />
                    </td>
                    <td className="table-td text-gray-500 dark:text-dark-muted">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        {user.isActive && user.role !== "Admin" && (
                          <button
                            onClick={() => openConfirm(user._id, "deactivate")}
                            className="btn-icon text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                            title="Deactivate user"
                          >
                            <FiUserX size={16} />
                          </button>
                        )}
                        {user.role !== "Admin" && (
                          <button
                            onClick={() => openConfirm(user._id, "delete")}
                            className="btn-icon text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete user"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 dark:border-dark-border text-xs text-gray-400 dark:text-dark-muted">
            Showing {filtered.length} of {users.length} users
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmId}
        title={confirmType === "delete" ? "Delete User" : "Deactivate User"}
        message={
          confirmType === "delete"
            ? "This will permanently delete the user and all their data. This cannot be undone."
            : "The user will lose access to their account. You can reactivate them later."
        }
        confirmLabel={confirmType === "delete" ? "Delete" : "Deactivate"}
        danger={confirmType === "delete"}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
};

export default Users;
