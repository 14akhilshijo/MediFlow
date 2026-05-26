import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch.js";
import { appointmentAPI } from "../../services/api.js";
import Spinner from "../../components/common/Spinner.jsx";
import toast from "react-hot-toast";

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
];

const BookAppointment = () => {
  const navigate = useNavigate();
  const { data: doctorsData, loading } = useFetch("/api/v1/doctors");
  const [form, setForm] = useState({
    doctor: "", appointmentDate: "", timeSlot: "", type: "In-Person", reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await appointmentAPI.book(form);
      toast.success("Appointment booked successfully!");
      navigate("/my-appointments");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner fullScreen />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
      <p className="text-gray-500 mb-8">Fill in the details to schedule your visit.</p>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Doctor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
            <select name="doctor" value={form.doctor} onChange={handleChange}
              className="input-field" required>
              <option value="">-- Choose a doctor --</option>
              {doctorsData?.doctors?.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  Dr. {doc.user?.firstName} {doc.user?.lastName} – {doc.specialization}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
            <input type="date" name="appointmentDate" value={form.appointmentDate}
              onChange={handleChange} className="input-field"
              min={new Date().toISOString().split("T")[0]} required />
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, timeSlot: slot }))}
                  className={`py-2 px-3 text-xs rounded-lg border font-medium transition-colors ${
                    form.timeSlot === slot
                      ? "bg-primary-600 text-white border-primary-600"
                      : "border-gray-200 text-gray-600 hover:border-primary-400"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type</label>
            <select name="type" value={form.type} onChange={handleChange} className="input-field">
              <option value="In-Person">In-Person</option>
              <option value="Video">Video Consultation</option>
              <option value="Phone">Phone Consultation</option>
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
            <textarea name="reason" value={form.reason} onChange={handleChange}
              rows={3} className="input-field resize-none"
              placeholder="Briefly describe your symptoms or reason..." required />
          </div>

          <button type="submit" disabled={submitting || !form.timeSlot} className="btn-primary w-full">
            {submitting ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
