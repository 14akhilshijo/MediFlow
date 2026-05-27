
import { useState, useEffect } from "react";
import { FiX, FiPlus, FiTrash2, FiClock } from "react-icons/fi";
import { adminDoctorAPI } from "../../services/adminApi.js";
import toast from "react-hot-toast";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const EMPTY_SLOT = {
  day: "Monday", startTime: "09:00", endTime: "17:00",
  maxPatients: 10, isAvailable: true,
};

const DAY_COLORS = {
  Monday:    "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
  Tuesday:   "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400",
  Wednesday: "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400",
  Thursday:  "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
  Friday:    "bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400",
  Saturday:  "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",
  Sunday:    "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
};

const AvailabilityModal = ({ open, doctor, onClose, onSuccess }) => {
  const [slots, setSlots]   = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSlots(
      doctor?.availableSlots?.length
        ? doctor.availableSlots.map((s) => ({ ...s }))
        : []
    );
  }, [open, doctor]);

  if (!open) return null;

  const addSlot = () => setSlots((p) => [...p, { ...EMPTY_SLOT }]);

  const removeSlot = (i) => setSlots((p) => p.filter((_, idx) => idx !== i));

  const updateSlot = (i, field, value) =>
    setSlots((p) => p.map((s, idx) => idx === i ? { ...s, [field]: value } : s));

  const handleSave = async () => {

    for (const [i, slot] of slots.entries()) {
      if (!slot.startTime || !slot.endTime) {
        toast.error(`Slot ${i + 1}: start and end time are required.`);
        return;
      }
      if (slot.startTime >= slot.endTime) {
        toast.error(`Slot ${i + 1}: end time must be after start time.`);
        return;
      }
    }

    setSaving(true);
    try {
      await adminDoctorAPI.updateAvailability(doctor._id, slots);
      toast.success("Availability schedule updated.");
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
        className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        { }
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-border shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiClock size={18} className="text-primary-600" />
              Availability Schedule
            </h2>
            <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">
              Dr. {doctor?.user?.firstName} {doctor?.user?.lastName}
            </p>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close">
            <FiX size={20} />
          </button>
        </div>

        { }
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {slots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-dark-border flex items-center justify-center mb-3">
                <FiClock size={22} className="text-gray-400 dark:text-dark-muted" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No slots added yet</p>
              <p className="text-xs text-gray-400 dark:text-dark-muted mt-1">Click "Add Slot" to define availability</p>
            </div>
          ) : (
            <div className="space-y-3">
              {slots.map((slot, i) => (
                <div
                  key={i}
                  className="border border-gray-100 dark:border-dark-border rounded-xl p-4 bg-gray-50/50 dark:bg-dark-bg/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`badge text-xs font-semibold ${DAY_COLORS[slot.day] ?? "bg-gray-100 text-gray-600"}`}>
                      {slot.day}
                    </span>
                    <div className="flex items-center gap-2">
                      { }
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <div
                          onClick={() => updateSlot(i, "isAvailable", !slot.isAvailable)}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                            slot.isAvailable ? "bg-primary-600" : "bg-gray-300 dark:bg-dark-border"
                          }`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            slot.isAvailable ? "translate-x-4" : "translate-x-0.5"
                          }`} />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-dark-muted">
                          {slot.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeSlot(i)}
                        className="btn-icon text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        aria-label="Remove slot"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    { }
                    <div>
                      <label className="input-label text-xs">Day</label>
                      <select
                        value={slot.day}
                        onChange={(e) => updateSlot(i, "day", e.target.value)}
                        className="input-field text-sm py-2"
                      >
                        {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    { }
                    <div>
                      <label className="input-label text-xs">Start Time</label>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateSlot(i, "startTime", e.target.value)}
                        className="input-field text-sm py-2"
                      />
                    </div>

                    { }
                    <div>
                      <label className="input-label text-xs">End Time</label>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateSlot(i, "endTime", e.target.value)}
                        className="input-field text-sm py-2"
                      />
                    </div>

                    { }
                    <div>
                      <label className="input-label text-xs">Max Patients</label>
                      <input
                        type="number"
                        value={slot.maxPatients}
                        onChange={(e) => updateSlot(i, "maxPatients", Number(e.target.value))}
                        className="input-field text-sm py-2"
                        min={1} max={100}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        { }
        <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-between shrink-0">
          <button type="button" onClick={addSlot} className="btn-secondary">
            <FiPlus size={15} /> Add Slot
          </button>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary min-w-[120px]"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : "Save Schedule"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityModal;
