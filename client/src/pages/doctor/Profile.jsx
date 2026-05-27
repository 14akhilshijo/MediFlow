import { useState, useEffect } from "react";
import { FiUser, FiMail, FiPhone, FiStar, FiAward, FiDollarSign, FiPlus, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import useFetch from "../../hooks/useFetch.js";
import Spinner from "../../components/common/Spinner.jsx";
import api from "../../services/api.js";
import toast from "react-hot-toast";

const DoctorProfile = () => {
  const { user, refreshUser } = useAuth();
  const { data, loading }     = useFetch("/api/v1/doctors/my-profile");

  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "",
  });
  const [doctorForm, setDoctorForm] = useState({
    specialization: "", bio: "", experience: "", consultationFee: "", followUpFee: "",
  });
  const [qualifications, setQualifications] = useState([]);
  const [saving, setSaving]   = useState(false);
  const [doctorId, setDoctorId] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName:  user.lastName  || "",
        phone:     user.phone     || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (data?.doctor) {
      const d = data.doctor;
      setDoctorId(d._id);
      setDoctorForm({
        specialization:  d.specialization  || "",
        bio:             d.bio             || "",
        experience:      d.experience      ?? "",
        consultationFee: d.consultationFee ?? "",
        followUpFee:     d.followUpFee     ?? "",
      });
      setQualifications(d.qualifications || []);
    }
  }, [data]);

  const handleUserChange  = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleDoctorChange = (e) => setDoctorForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addQualification = () =>
    setQualifications((p) => [...p, { degree: "", institution: "", year: new Date().getFullYear() }]);

  const removeQualification = (i) =>
    setQualifications((p) => p.filter((_, idx) => idx !== i));

  const updateQualification = (i, field, value) =>
    setQualifications((p) =>
      p.map((q, idx) => (idx === i ? { ...q, [field]: value } : q))
    );

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {

      await api.patch("/users/profile", form);

      if (doctorId) {
        await api.patch(`/doctors/${doctorId}`, {
          ...doctorForm,
          experience:      Number(doctorForm.experience),
          consultationFee: Number(doctorForm.consultationFee),
          followUpFee:     Number(doctorForm.followUpFee),
          qualifications,
        });
      }

      await refreshUser();
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">My Profile</h1>

      <form onSubmit={handleSave} className="space-y-6">

        { }
        <div className="card">
          <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100 dark:border-gray-800">
            <img
              src={
                user?.avatar?.url ||
                `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&size=80&background=0D8ABC&color=fff&rounded=true`
              }
              alt={user?.firstName}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-primary-100 dark:border-primary-900/30"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dr. {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              <span className="inline-block mt-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full font-medium">
                Doctor
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FiUser size={13} className="inline mr-1" />First Name
              </label>
              <input type="text" name="firstName" value={form.firstName}
                onChange={handleUserChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FiUser size={13} className="inline mr-1" />Last Name
              </label>
              <input type="text" name="lastName" value={form.lastName}
                onChange={handleUserChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FiPhone size={13} className="inline mr-1" />Phone
              </label>
              <input type="tel" name="phone" value={form.phone}
                onChange={handleUserChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FiMail size={13} className="inline mr-1" />Email
              </label>
              <input type="email" value={user?.email}
                className="input-field bg-gray-50 dark:bg-gray-800/50" disabled />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
            </div>
          </div>
        </div>

        { }
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <FiAward size={16} className="text-primary-500" />
            Professional Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Specialization
              </label>
              <input type="text" name="specialization" value={doctorForm.specialization}
                onChange={handleDoctorChange} className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Experience (years)
              </label>
              <input type="number" name="experience" min={0} max={60}
                value={doctorForm.experience} onChange={handleDoctorChange} className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FiDollarSign size={13} className="inline mr-1" />Consultation Fee (₹)
              </label>
              <input type="number" name="consultationFee" min={0}
                value={doctorForm.consultationFee} onChange={handleDoctorChange} className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FiDollarSign size={13} className="inline mr-1" />Follow-up Fee (₹)
              </label>
              <input type="number" name="followUpFee" min={0}
                value={doctorForm.followUpFee} onChange={handleDoctorChange} className="input-field" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea name="bio" rows={4} value={doctorForm.bio}
                onChange={handleDoctorChange} className="input-field resize-none"
                placeholder="Write a short professional bio…" maxLength={600} />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {doctorForm.bio.length}/600
              </p>
            </div>
          </div>
        </div>

        { }
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiStar size={16} className="text-amber-500" />
              Qualifications
            </h3>
            <button
              type="button"
              onClick={addQualification}
              className="btn-outline text-xs flex items-center gap-1.5 py-1.5 px-3"
            >
              <FiPlus size={13} /> Add
            </button>
          </div>

          {qualifications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No qualifications added yet.</p>
          ) : (
            <div className="space-y-3">
              {qualifications.map((q, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <input
                    type="text"
                    placeholder="Degree (e.g. MBBS)"
                    value={q.degree}
                    onChange={(e) => updateQualification(i, "degree", e.target.value)}
                    className="input-field text-sm"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Institution"
                    value={q.institution}
                    onChange={(e) => updateQualification(i, "institution", e.target.value)}
                    className="input-field text-sm"
                    required
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Year"
                      min={1950}
                      max={new Date().getFullYear()}
                      value={q.year}
                      onChange={(e) => updateQualification(i, "year", Number(e.target.value))}
                      className="input-field text-sm flex-1"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeQualification(i)}
                      className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        { }
        <button type="submit" disabled={saving} className="btn-primary w-full py-3">
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </form>
    </div>
  );
};

export default DoctorProfile;
