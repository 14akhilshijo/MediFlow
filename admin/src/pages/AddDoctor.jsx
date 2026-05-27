import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminDoctorAPI, adminDepartmentAPI } from "../services/adminApi.js";
import { FiCamera, FiArrowLeft, FiUser } from "react-icons/fi";
import PageHeader from "../components/common/PageHeader.jsx";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  firstName: "", lastName: "", email: "", phone: "", password: "",
  gender: "", dob: "", department: "", specialization: "",
  experience: "", bio: "", consultationFee: "",
};

const Field = ({ label, required, children }) => (
  <div>
    <label className="input-label">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const AddDoctor = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [avatar, setAvatar]           = useState(null);
  const [preview, setPreview]         = useState(null);

  useEffect(() => {
    adminDepartmentAPI.getAll()
      .then(({ data }) => setDepartments(data.departments ?? []))
      .catch(() => {});
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (avatar) fd.append("avatar", avatar);
      await adminDoctorAPI.add(fd);
      toast.success("Doctor added successfully.");
      navigate("/doctors");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <PageHeader
        title="Add New Doctor"
        subtitle="Register a new doctor to the MediFlow system."
        action={
          <button onClick={() => navigate("/doctors")} className="btn-secondary">
            <FiArrowLeft size={15} /> Back
          </button>
        }
      />

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">

          { }
          <div className="flex items-center gap-5 pb-6 border-b border-gray-100 dark:border-dark-border">
            <div className="relative">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-primary-100 dark:border-primary-900/30"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-dark-border flex items-center justify-center border-4 border-gray-50 dark:border-dark-surface">
                  <FiUser size={28} className="text-gray-400 dark:text-dark-muted" />
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 hover:bg-primary-700 rounded-lg flex items-center justify-center cursor-pointer shadow-sm transition-colors">
                <FiCamera size={13} className="text-white" />
                <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
              </label>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Profile Photo</p>
              <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">JPG, PNG or WebP · Max 5 MB</p>
            </div>
          </div>

          { }
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" required>
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange}
                  className="input-field" placeholder="John" required />
              </Field>
              <Field label="Last Name" required>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange}
                  className="input-field" placeholder="Smith" required />
              </Field>
              <Field label="Email Address" required>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  className="input-field" placeholder="doctor@mediflow.com" required />
              </Field>
              <Field label="Phone Number" required>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                  className="input-field" placeholder="+1 234 567 8900" required />
              </Field>
              <Field label="Gender" required>
                <select name="gender" value={form.gender} onChange={handleChange}
                  className="input-field" required>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
              <Field label="Date of Birth" required>
                <input type="date" name="dob" value={form.dob} onChange={handleChange}
                  className="input-field" required />
              </Field>
            </div>
          </div>

          { }
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider mb-4">
              Account Credentials
            </h3>
            <Field label="Password" required>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                className="input-field" placeholder="Min. 8 characters" minLength={8} required />
            </Field>
          </div>

          { }
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider mb-4">
              Professional Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Department" required>
                <select name="department" value={form.department} onChange={handleChange}
                  className="input-field" required>
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.icon} {d.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Specialization" required>
                <input type="text" name="specialization" value={form.specialization} onChange={handleChange}
                  className="input-field" placeholder="e.g. Cardiologist" required />
              </Field>
              <Field label="Experience (years)" required>
                <input type="number" name="experience" value={form.experience} onChange={handleChange}
                  className="input-field" min={0} max={60} placeholder="5" required />
              </Field>
              <Field label="Consultation Fee ($)" required>
                <input type="number" name="consultationFee" value={form.consultationFee} onChange={handleChange}
                  className="input-field" min={0} placeholder="150" required />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Bio">
                <textarea name="bio" value={form.bio} onChange={handleChange}
                  rows={3} className="input-field resize-none"
                  placeholder="Brief professional biography…" />
              </Field>
            </div>
          </div>

          { }
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-dark-border">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding Doctor…
                </span>
              ) : "Add Doctor"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/doctors")}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctor;
