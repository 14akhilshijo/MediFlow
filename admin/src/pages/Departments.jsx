import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiEdit2, FiLayers, FiX, FiCheck } from "react-icons/fi";
import { adminDepartmentAPI } from "../services/adminApi.js";
import Spinner from "../components/common/Spinner.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ConfirmModal from "../components/common/ConfirmModal.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import toast from "react-hot-toast";

const EMPTY_FORM = { name: "", description: "", icon: "" };

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [editing, setEditing]         = useState(null);
  const [saving, setSaving]           = useState(false);
  const [confirmId, setConfirmId]     = useState(null);

  const fetchDepts = async () => {
    try {
      const { data } = await adminDepartmentAPI.getAll();
      setDepartments(data.departments ?? []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepts(); }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await adminDepartmentAPI.update(editing, form);
        toast.success("Department updated.");
        setEditing(null);
      } else {
        await adminDepartmentAPI.create(form);
        toast.success("Department created.");
      }
      setForm(EMPTY_FORM);
      fetchDepts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (dept) => {
    setEditing(dept._id);
    setForm({ name: dept.name, description: dept.description || "", icon: dept.icon || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async () => {
    try {
      await adminDepartmentAPI.delete(confirmId);
      toast.success("Department deleted.");
      fetchDepts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirmId(null);
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Departments"
        subtitle={`${departments.length} active departments`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Form ── */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">
              {editing ? "Edit Department" : "New Department"}
            </h2>
            {editing && (
              <button onClick={cancelEdit} className="btn-icon">
                <FiX size={16} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Icon (emoji)</label>
              <input
                type="text"
                name="icon"
                value={form.icon}
                onChange={handleChange}
                className="input-field"
                placeholder="🏥"
                maxLength={4}
              />
            </div>
            <div>
              <label className="input-label">Department Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Cardiology"
                required
              />
            </div>
            <div>
              <label className="input-label">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="input-field resize-none"
                placeholder="Brief description of this department…"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : (
                  <>
                    {editing ? <FiCheck size={15} /> : <FiPlus size={15} />}
                    {editing ? "Update" : "Add Department"}
                  </>
                )}
              </button>
              {editing && (
                <button type="button" onClick={cancelEdit} className="btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ── List ── */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          {loading ? (
            <Spinner />
          ) : departments.length === 0 ? (
            <EmptyState
              icon={FiLayers}
              title="No departments yet"
              description="Add your first department using the form."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-dark-bg/50 border-b border-gray-100 dark:border-dark-border">
                    <tr>
                      <th className="table-th w-16">Icon</th>
                      <th className="table-th">Name</th>
                      <th className="table-th">Description</th>
                      <th className="table-th w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                    {departments.map((dept) => (
                      <tr
                        key={dept._id}
                        className={`table-row ${editing === dept._id ? "bg-primary-50 dark:bg-primary-900/10" : ""}`}
                      >
                        <td className="table-td">
                          <span className="text-2xl">{dept.icon || "🏥"}</span>
                        </td>
                        <td className="table-td">
                          <p className="font-semibold text-gray-900 dark:text-white">{dept.name}</p>
                          <p className="text-xs text-gray-400 dark:text-dark-muted">
                            {dept.isActive ? "Active" : "Inactive"}
                          </p>
                        </td>
                        <td className="table-td text-gray-500 dark:text-dark-muted text-xs max-w-xs">
                          <p className="line-clamp-2">{dept.description || "—"}</p>
                        </td>
                        <td className="table-td">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(dept)}
                              className="btn-icon text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                              title="Edit"
                            >
                              <FiEdit2 size={15} />
                            </button>
                            <button
                              onClick={() => setConfirmId(dept._id)}
                              className="btn-icon text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Delete"
                            >
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 dark:border-dark-border text-xs text-gray-400 dark:text-dark-muted">
                {departments.length} department{departments.length !== 1 ? "s" : ""}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!confirmId}
        title="Delete Department"
        message="Deleting this department may affect doctors and appointments linked to it. This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
};

export default Departments;
