/**
 * DoctorDetailModal
 *
 * Read-only view of a doctor's full profile.
 *
 * Props:
 *   open    {boolean}
 *   doctor  {object|null}
 *   onClose {function}
 *   onEdit  {function}
 */

import { FiX, FiEdit2, FiStar, FiClock, FiDollarSign, FiAward, FiCheckCircle } from "react-icons/fi";
import StatusBadge from "../common/StatusBadge.jsx";

const DAY_SHORT = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" };

const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-2 py-2 border-b border-gray-50 dark:border-dark-border last:border-0">
    <span className="text-xs text-gray-400 dark:text-dark-muted w-32 shrink-0 pt-0.5">{label}</span>
    <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{value || "—"}</span>
  </div>
);

const DoctorDetailModal = ({ open, doctor, onClose, onEdit }) => {
  if (!open || !doctor) return null;

  const u = doctor.user ?? {};
  const availableDays = [...new Set((doctor.availableSlots ?? []).map((s) => s.day))];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-xl mx-4 flex flex-col max-h-[90vh] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-border shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Doctor Profile</h2>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="btn-secondary text-sm py-1.5 px-3">
              <FiEdit2 size={14} /> Edit
            </button>
            <button onClick={onClose} className="btn-icon" aria-label="Close">
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Profile header */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={u.avatar?.url || "/default-avatar.png"}
                alt="Doctor"
                className="w-16 h-16 rounded-2xl object-cover bg-gray-100 dark:bg-dark-border"
              />
              {doctor.isVerified && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-dark-surface">
                  <FiCheckCircle size={11} className="text-white" />
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Dr. {u.firstName} {u.lastName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-dark-muted">{doctor.specialization}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <StatusBadge label={doctor.isVerified ? "Verified" : "Unverified"} />
                <StatusBadge label={doctor.isAcceptingPatients ? "Active" : "Inactive"} />
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: FiStar,       label: "Rating",     value: `${doctor.rating?.average?.toFixed(1) ?? "0.0"} (${doctor.rating?.count ?? 0})` },
              { icon: FiDollarSign, label: "Fee",        value: `$${doctor.consultationFee}` },
              { icon: FiAward,      label: "Experience", value: `${doctor.experience} yr${doctor.experience !== 1 ? "s" : ""}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-dark-bg/50 rounded-xl p-3 text-center">
                <Icon size={16} className="text-primary-600 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-400 dark:text-dark-muted">{label}</p>
              </div>
            ))}
          </div>

          {/* Contact & Personal */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-widest mb-2">Contact</h4>
            <InfoRow label="Email"      value={u.email} />
            <InfoRow label="Phone"      value={u.phone} />
            <InfoRow label="Gender"     value={u.gender} />
            <InfoRow label="Department" value={doctor.department?.name} />
            <InfoRow label="Follow-up Fee" value={doctor.followUpFee ? `$${doctor.followUpFee}` : "—"} />
          </div>

          {/* Bio */}
          {doctor.bio && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-widest mb-2">Bio</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{doctor.bio}</p>
            </div>
          )}

          {/* Qualifications */}
          {doctor.qualifications?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-widest mb-2">Qualifications</h4>
              <div className="space-y-2">
                {doctor.qualifications.map((q, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-dark-bg/50 rounded-xl px-3 py-2">
                    <FiAward size={14} className="text-primary-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{q.degree}</p>
                      <p className="text-xs text-gray-400 dark:text-dark-muted">{q.institution} · {q.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-widest mb-2">
              Availability ({doctor.availableSlots?.length ?? 0} slots)
            </h4>
            {doctor.availableSlots?.length > 0 ? (
              <div className="space-y-2">
                {doctor.availableSlots.map((slot, i) => (
                  <div key={i} className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                    slot.isAvailable
                      ? "bg-green-50 dark:bg-green-900/10"
                      : "bg-gray-50 dark:bg-dark-bg/50 opacity-60"
                  }`}>
                    <div className="flex items-center gap-2">
                      <FiClock size={13} className={slot.isAvailable ? "text-green-600 dark:text-green-400" : "text-gray-400"} />
                      <span className="font-medium text-gray-800 dark:text-gray-200">{slot.day}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-dark-muted">
                      <span>{slot.startTime} – {slot.endTime}</span>
                      <span className="badge bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400">
                        {slot.maxPatients} pts
                      </span>
                      {!slot.isAvailable && (
                        <span className="badge bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">Off</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-dark-muted">No availability set.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailModal;
