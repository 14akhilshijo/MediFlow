/**
 * DoctorFormModal
 *
 * Handles both Add and Edit modes.
 * - Add mode: all fields required, password required
 * - Edit mode: all fields optional, password hidden
 *
 * Props:
 *   open        {boolean}
 *   mode        {"add"|"edit"}
 *   doctor      {object|null}   – populated doctor doc (edit mode)
 *   departments {array}
 *   onClose     {function}
 *   onSuccess   {function}      – called after successful save
 */

import { useState, useEffect, useRef } from "react";
import { FiX, FiCamera, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { adminDoctorAPI } from "../../services/adminApi.js";
import toast from "react-hot-toast";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const EMPTY_FORM = {
  firstName: "", lastName: "", email: "", phone: "", password: "",
  gender: "", dob: "",
  department: "", specialization: "", experience: "", bio: "",
  consultationFee: "", followUpFee: "",
};

const Field = ({ label, required, error, children, className = "" }) => (
  <div className={className}>
    <label className="input-label">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const SectionTitle = ({ children }) => (
  <h3 className="text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-widest mb-3 mt-1">
    {children}
  </h3>
);

const DoctorFormModal = ({ open, mode, doctor, departments, onClose, onSuccess }) => {
  const isEdit = mode === "edit";
  const [form, setForm]         = useState(EMPTY_FORM);
  const [avatar, setAvatar]     = useState(null);
  const [preview, setPreview]   = useState(null);
  const [showPwd, setShowPwd]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);
  const fileRef                 = useRef(null);

  // Populate form when editing
  useEffect(() => {
    if (!open) return;
    if (isEdit && doctor) {
      const u = doctor.user ?? {};
      setForm({
        firstName:       u.firstName       ?? "",
        lastName:        u.lastName        ?? "",
        email:           u.email           ?? "",
        phone:           u.phone           ?? "",
        password:        "",
        gender:          u.gender          ?? "",
        dob:             u.dob ? u.dob.slice(0, 10) : "",
        department:      doctor.department?._id ?? doctor.department ?? "",
        specialization:  doctor.specialization  ?? "",
        experience:      doctor.experience      ?? "",
        bio:             doctor.bio             ?? "",
        consultationFee: doctor.consultationFee ?? "",
        followUpFee:     doctor.followUpFee     ?? "",
      });
      setPreview(u.avatar?.url || null);
    } else {
      setForm(EMPTY_FORM);
      setPreview(null);
    }
    setAvatar(null);
    setErrors({});
  }, [open, mode, doctor]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB."); return; }
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  // Client-side validation
  const validate = () => {
    const errs = {};
    if (!isEdit) {
      if (!form.firstName.trim())  errs.firstName  = "First name is required";
      if (!form.lastName.trim())   errs.lastName   = "Last name is required";
      if (!form.email.trim())      errs.email      = "Email is required";
      if (!form.phone.trim())      errs.phone      = "Phone is required";
      if (!form.password)          errs.password   = "Password is required (min 8 chars)";
      else if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
      if (!form.gender)            errs.gender     = "Gender is required";
      if (!form.dob)               errs.dob        = "Date of birth is required";
    }
    if (!form.department)          errs.department     = "Department is required";
    if (!form.specialization.trim()) errs.specialization = "Specialization is required";
    if (form.experience === "" || form.experience === undefined)
                                   errs.experience     = "Experience is required";
    if (form.consultationFee === "" || form.consultationFee === undefined)
                                   errs.consultationFee = "Consultation fee is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (isEdit && k === "password") return; // never send empty password on edit
        if (v !== "" && v !== undefined) fd.append(k, v);
      });
      if (avatar) fd.append("avatar", avatar);

      if (isEdit) {
        await adminDoctorAPI.update(doctor._id, fd);
        toast.success("Doctor updated successfully.");
      } else {
        await adminDoctorAPI.add(fd);
        toast.success("Doctor added successfully.");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[92vh] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-border shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEdit ? "Edit Doctor" : "Add New Doctor"}
            </h2>
            <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">
              {isEdit ? "Update doctor profile and professional details." : "Register a new doctor to MediFlow."}
            </p>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close">
            <FiX size={20} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {preview ? (
                <img src={preview} alt="Preview"
                  className="w-18 h-18 w-[72px] h-[72px] rounded-2xl object-cover border-4 border-primary-100 dark:border-primary-900/30" />
              ) : (
                <div className="w-[72px] h-[72px] rounded-2xl bg-gray-100 dark:bg-dark-border flex items-center justify-center border-4 border-gray-50 dark:border-dark-surface">
                  <FiUser size={26} className="text-gray-400 dark:text-dark-muted" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 hover:bg-primary-700 rounded-lg flex items-center justify-center shadow-sm transition-colors"
                aria-label="Upload photo"
              >
                <FiCamera size={13} className="text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">Profile Photo</p>
              <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">JPG, PNG or WebP · Max 5 MB</p>
            </div>
          </div>

          {/* Personal Info – hidden in edit mode for email */}
          {!isEdit && (
            <>
              <div>
                <SectionTitle>Personal Information</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First Name" required error={errors.firstName}>
                    <input name="firstName" value={form.firstName} onChange={handleChange}
                      className={`input-field ${errors.firstName ? "border-red-400" : ""}`}
                      placeholder="John" />
                  </Field>
                  <Field label="Last Name" required error={errors.lastName}>
                    <input name="lastName" value={form.lastName} onChange={handleChange}
                      className={`input-field ${errors.lastName ? "border-red-400" : ""}`}
                      placeholder="Smith" />
                  </Field>
                  <Field label="Email Address" required error={errors.email}>
                    <input type="email" name="email" value={form.email} onChange={handleChange}
                      className={`input-field ${errors.email ? "border-red-400" : ""}`}
                      placeholder="doctor@mediflow.com" />
                  </Field>
                  <Field label="Phone Number" required error={errors.phone}>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                      className={`input-field ${errors.phone ? "border-red-400" : ""}`}
                      placeholder="+1 234 567 8900" />
                  </Field>
                  <Field label="Gender" required error={errors.gender}>
                    <select name="gender" value={form.gender} onChange={handleChange}
                      className={`input-field ${errors.gender ? "border-red-400" : ""}`}>
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </Field>
                  <Field label="Date of Birth" required error={errors.dob}>
                    <input type="date" name="dob" value={form.dob} onChange={handleChange}
                      className={`input-field ${errors.dob ? "border-red-400" : ""}`} />
                  </Field>
                </div>
              </div>

              <div>
                <SectionTitle>Account Credentials</SectionTitle>
                <Field label="Password" required error={errors.password}>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      name="password" value={form.password} onChange={handleChange}
                      className={`input-field pr-10 ${errors.password ? "border-red-400" : ""}`}
                      placeholder="Min. 8 characters, 1 uppercase, 1 number" />
                    <button type="button" onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </Field>
              </div>
            </>
          )}

          {/* Edit mode: only show editable personal fields */}
          {isEdit && (
            <div>
              <SectionTitle>Personal Information</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name">
                  <input name="firstName" value={form.firstName} onChange={handleChange}
                    className="input-field" placeholder="John" />
                </Field>
                <Field label="Last Name">
                  <input name="lastName" value={form.lastName} onChange={handleChange}
                    className="input-field" placeholder="Smith" />
                </Field>
                <Field label="Phone Number">
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                    className="input-field" placeholder="+1 234 567 8900" />
                </Field>
                <Field label="Gender">
                  <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
                <Field label="Date of Birth" className="sm:col-span-2">
                  <input type="date" name="dob" value={form.dob} onChange={handleChange}
                    className="input-field" />
                </Field>
              </div>
            </div>
          )}

          {/* Professional Details */}
          <div>
            <SectionTitle>Professional Details</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Department" required error={errors.department}>
                <select name="department" value={form.department} onChange={handleChange}
                  className={`input-field ${errors.department ? "border-red-400" : ""}`}>
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.icon} {d.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Specialization" required error={errors.specialization}>
                <input name="specialization" value={form.specialization} onChange={handleChange}
                  className={`input-field ${errors.specialization ? "border-red-400" : ""}`}
                  placeholder="e.g. Cardiologist" />
              </Field>
              <Field label="Experience (years)" required error={errors.experience}>
                <input type="number" name="experience" value={form.experience} onChange={handleChange}
                  className={`input-field ${errors.experience ? "border-red-400" : ""}`}
                  min={0} max={60} placeholder="5" />
              </Field>
              <Field label="Consultation Fee ($)" required error={errors.consultationFee}>
                <input type="number" name="consultationFee" value={form.consultationFee} onChange={handleChange}
                  className={`input-field ${errors.consultationFee ? "border-red-400" : ""}`}
                  min={0} placeholder="150" />
              </Field>
              <Field label="Follow-up Fee ($)">
                <input type="number" name="followUpFee" value={form.followUpFee} onChange={handleChange}
                  className="input-field" min={0} placeholder="75" />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Bio">
                <textarea name="bio" value={form.bio} onChange={handleChange}
                  rows={3} className="input-field resize-none"
                  placeholder="Brief professional biography (max 600 characters)…"
                  maxLength={600} />
                <p className="text-xs text-gray-400 dark:text-dark-muted text-right mt-1">
                  {form.bio.length}/600
                </p>
              </Field>
            </div>
          </div>
        </form>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            form="doctor-form"
            disabled={saving}
            onClick={handleSubmit}
            className="btn-primary min-w-[120px]"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isEdit ? "Saving…" : "Adding…"}
              </span>
            ) : isEdit ? "Save Changes" : "Add Doctor"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorFormModal;
