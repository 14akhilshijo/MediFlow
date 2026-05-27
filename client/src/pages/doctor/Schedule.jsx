import { useState, useEffect } from "react";
import { FiClock, FiPlus, FiTrash2, FiSave, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import useFetch from "../../hooks/useFetch.js";
import Spinner from "../../components/common/Spinner.jsx";
import api from "../../services/api.js";
import toast from "react-hot-toast";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DAY_COLORS = {
  Monday:    "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  Tuesday:   "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800",
  Wednesday: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
  Thursday:  "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
  Friday:    "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800",
  Saturday:  "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800",
  Sunday:    "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
};

const emptySlot = () => ({
  _id:         Date.now().toString(),
  day:         "Monday",
  startTime:   "09:00",
  endTime:     "17:00",
  isAvailable: true,
  maxPatients: 10,
  isNew:       true,
});

const DoctorSchedule = () => {
  const { data, loading } = useFetch("/api/v1/doctors/my-profile");
  const [slots, setSlots]   = useState([]);
  const [saving, setSaving] = useState(false);
  const [doctorId, setDoctorId] = useState(null);

  useEffect(() => {
    if (data?.doctor) {
      setSlots(data.doctor.availableSlots || []);
      setDoctorId(data.doctor._id);
    }
  }, [data]);

  const addSlot = () => setSlots((prev) => [...prev, emptySlot()]);

  const removeSlot = (id) => setSlots((prev) => prev.filter((s) => s._id !== id));

  const updateSlot = (id, field, value) =>
    setSlots((prev) =>
      prev.map((s) => (s._id === id ? { ...s, [field]: value } : s))
    );

  const handleSave = async () => {

    for (const slot of slots) {
      if (slot.startTime >= slot.endTime) {
        toast.error(`${slot.day}: Start time must be before end time.`);
        return;
      }
    }

    setSaving(true);
    try {
      await api.patch(`/doctors/${doctorId}/availability`, {
        availableSlots: slots.map(({ isNew, ...s }) => s),
      });
      toast.success("Schedule saved successfully.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const slotsByDay = DAYS.reduce((acc, day) => {
    acc[day] = slots.filter((s) => s.day === day);
    return acc;
  }, {});

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      { }
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Schedule</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Manage your weekly availability and time slots
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={addSlot}
            className="btn-outline text-sm flex items-center gap-2"
          >
            <FiPlus size={15} /> Add Slot
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <FiSave size={15} />
            {saving ? "Saving…" : "Save Schedule"}
          </button>
        </div>
      </div>

      {slots.length === 0 ? (
        <div className="card text-center py-16">
          <FiClock size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium mb-4">No availability slots configured yet.</p>
          <button onClick={addSlot} className="btn-primary text-sm inline-flex items-center gap-2">
            <FiPlus size={15} /> Add Your First Slot
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {DAYS.map((day) => {
            const daySlots = slotsByDay[day];
            if (daySlots.length === 0) return null;
            return (
              <div key={day} className={`rounded-2xl border p-5 ${DAY_COLORS[day]}`}>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiClock size={15} />
                  {day}
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                    ({daySlots.length} slot{daySlots.length !== 1 ? "s" : ""})
                  </span>
                </h3>
                <div className="space-y-3">
                  {daySlots.map((slot) => (
                    <div
                      key={slot._id}
                      className="bg-white dark:bg-gray-900 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm"
                    >
                      { }
                      <select
                        value={slot.day}
                        onChange={(e) => updateSlot(slot._id, "day", e.target.value)}
                        className="input-field text-sm w-full sm:w-36"
                      >
                        {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>

                      { }
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateSlot(slot._id, "startTime", e.target.value)}
                          className="input-field text-sm flex-1"
                        />
                        <span className="text-gray-400 text-sm shrink-0">to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateSlot(slot._id, "endTime", e.target.value)}
                          className="input-field text-sm flex-1"
                        />
                      </div>

                      { }
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Max</label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={slot.maxPatients}
                          onChange={(e) => updateSlot(slot._id, "maxPatients", Number(e.target.value))}
                          className="input-field text-sm w-16 text-center"
                        />
                      </div>

                      { }
                      <button
                        onClick={() => updateSlot(slot._id, "isAvailable", !slot.isAvailable)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all shrink-0 ${
                          slot.isAvailable
                            ? "text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800"
                            : "text-gray-400 border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                        }`}
                      >
                        {slot.isAvailable
                          ? <><FiToggleRight size={14} /> Active</>
                          : <><FiToggleLeft size={14} /> Off</>
                        }
                      </button>

                      { }
                      <button
                        onClick={() => removeSlot(slot._id)}
                        className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                        aria-label="Remove slot"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          { }
          {slots.filter((s) => !DAYS.some((d) => d === s.day) || slotsByDay[s.day]?.length === 0).length === 0 && null}
        </div>
      )}

      { }
      {slots.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={addSlot}
            className="btn-outline text-sm flex items-center gap-2"
          >
            <FiPlus size={15} /> Add Another Slot
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;
