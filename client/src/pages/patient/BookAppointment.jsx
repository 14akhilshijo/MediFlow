import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiSearch, FiFilter, FiCalendar, FiClock, FiUser,
  FiStar, FiBriefcase, FiDollarSign, FiCheckCircle,
  FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import useFetch from "../../hooks/useFetch.js";
import { appointmentAPI, doctorAPI } from "../../services/api.js";
import Spinner from "../../components/common/Spinner.jsx";
import toast from "react-hot-toast";

// ─── Constants ────────────────────────────────────────────────────────────────
const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM",
];

const STEPS = ["Choose Doctor", "Pick Date & Time", "Confirm"];

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {STEPS.map((label, i) => {
      const step = i + 1;
      const done = step < current;
      const active = step === current;
      return (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                done
                  ? "bg-accent-500 text-white"
                  : active
                  ? "bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900/40"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
              }`}
            >
              {done ? <FiCheckCircle size={16} /> : step}
            </div>
            <span
              className={`text-xs mt-1.5 font-medium hidden sm:block ${
                active ? "text-primary-600" : done ? "text-accent-600" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`w-16 sm:w-24 h-0.5 mx-1 mb-5 transition-all ${
                done ? "bg-accent-500" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Doctor Card ──────────────────────────────────────────────────────────────
const DoctorSelectCard = ({ doctor, selected, onSelect }) => {
  const { user, specialization, department, experience, consultationFee, rating } = doctor;
  const isSelected = selected?._id === doctor._id;

  return (
    <button
      type="button"
      onClick={() => onSelect(doctor)}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
        isSelected
          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md"
          : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <img
          src={user?.avatar?.url || "/default-avatar.png"}
          alt={`Dr. ${user?.firstName}`}
          className="w-14 h-14 rounded-xl object-cover border-2 border-gray-100 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                Dr. {user?.firstName} {user?.lastName}
              </p>
              <p className="text-primary-600 text-xs font-medium">{specialization}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs">{department?.name}</p>
            </div>
            {isSelected && (
              <FiCheckCircle size={18} className="text-primary-600 shrink-0 mt-0.5" />
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <FiBriefcase size={11} className="text-gray-400" />
              {experience}y exp
            </span>
            <span className="flex items-center gap-1">
              <FiStar size={11} className="text-yellow-400 fill-yellow-400" />
              {rating?.average?.toFixed(1) || "New"}
            </span>
            <span className="flex items-center gap-1 font-semibold text-green-600">
              <FiDollarSign size={11} />
              {consultationFee}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const BookAppointment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDoctorId = searchParams.get("doctor");

  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState({
    appointmentDate: "",
    timeSlot: "",
    type: "In-Person",
    reason: "",
  });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all verified doctors
  const { data: doctorsData, loading: loadingDoctors } = useFetch("/api/v1/doctors");
  const doctors = doctorsData?.doctors || [];

  // Unique specializations for filter
  const specializations = useMemo(() => {
    const specs = [...new Set(doctors.map((d) => d.specialization).filter(Boolean))];
    return ["All", ...specs.sort()];
  }, [doctors]);

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const name = `${doc.user?.firstName} ${doc.user?.lastName}`.toLowerCase();
      const spec = doc.specialization?.toLowerCase() || "";
      const dept = doc.department?.name?.toLowerCase() || "";
      const q = search.toLowerCase();
      const matchSearch = !q || name.includes(q) || spec.includes(q) || dept.includes(q);
      const matchSpec = specFilter === "All" || doc.specialization === specFilter;
      return matchSearch && matchSpec;
    });
  }, [doctors, search, specFilter]);

  // Pre-select doctor from URL param
  useEffect(() => {
    if (preselectedDoctorId && doctors.length > 0) {
      const doc = doctors.find((d) => d._id === preselectedDoctorId);
      if (doc) {
        setSelectedDoctor(doc);
        setStep(2);
      }
    }
  }, [preselectedDoctorId, doctors]);

  // Fetch booked slots when doctor + date changes
  useEffect(() => {
    if (!selectedDoctor || !form.appointmentDate) {
      setBookedSlots([]);
      return;
    }
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const { data } = await appointmentAPI.getBookedSlots(
          selectedDoctor._id,
          form.appointmentDate
        );
        setBookedSlots(data.bookedSlots || []);
      } catch {
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDoctor, form.appointmentDate]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSelectDoctor = (doc) => {
    setSelectedDoctor(doc);
    setForm((prev) => ({ ...prev, timeSlot: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.timeSlot) return toast.error("Please select a time slot.");
    if (!form.reason.trim()) return toast.error("Please describe your reason for visit.");

    setSubmitting(true);
    try {
      await appointmentAPI.book({
        doctor: selectedDoctor._id,
        ...form,
      });
      toast.success("Appointment booked successfully!");
      navigate("/my-appointments");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  // ── Step 1: Choose Doctor ──────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <FiSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, specialty, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Specialization Filter */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FiFilter size={13} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Filter by Specialization</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {specializations.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => setSpecFilter(spec)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                specFilter === spec
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor List */}
      {loadingDoctors ? (
        <Spinner />
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <FiUser size={32} className="mx-auto mb-2" />
          <p>No doctors found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
          {filteredDoctors.map((doc) => (
            <DoctorSelectCard
              key={doc._id}
              doctor={doc}
              selected={selectedDoctor}
              onSelect={handleSelectDoctor}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={!selectedDoctor}
        onClick={() => setStep(2)}
        className="btn-primary w-full"
      >
        Continue with Dr. {selectedDoctor?.user?.firstName || "..."}{" "}
        <FiChevronRight size={16} />
      </button>
    </div>
  );

  // ── Step 2: Pick Date & Time ───────────────────────────────────────────────
  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Selected Doctor Summary */}
      <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800">
        <img
          src={selectedDoctor?.user?.avatar?.url || "/default-avatar.png"}
          alt="Doctor"
          className="w-12 h-12 rounded-xl object-cover"
        />
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">
            Dr. {selectedDoctor?.user?.firstName} {selectedDoctor?.user?.lastName}
          </p>
          <p className="text-primary-600 text-xs">{selectedDoctor?.specialization}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            Consultation fee: <span className="font-semibold text-green-600">${selectedDoctor?.consultationFee}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="ml-auto text-xs text-primary-600 hover:underline font-medium"
        >
          Change
        </button>
      </div>

      {/* Date Picker */}
      <div>
        <label className="input-label flex items-center gap-1.5">
          <FiCalendar size={14} className="text-primary-500" />
          Appointment Date
        </label>
        <input
          type="date"
          name="appointmentDate"
          value={form.appointmentDate}
          onChange={(e) => {
            handleChange(e);
            setForm((prev) => ({ ...prev, timeSlot: "" }));
          }}
          min={today}
          max={maxDateStr}
          className="input-field"
          required
        />
      </div>

      {/* Time Slots */}
      {form.appointmentDate && (
        <div>
          <label className="input-label flex items-center gap-1.5">
            <FiClock size={14} className="text-primary-500" />
            Available Time Slots
            {loadingSlots && (
              <span className="text-xs text-gray-400 font-normal ml-1">Loading...</span>
            )}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => {
              const isBooked = bookedSlots.includes(slot);
              const isSelected = form.timeSlot === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={isBooked}
                  onClick={() => setForm((prev) => ({ ...prev, timeSlot: slot }))}
                  className={`py-2.5 px-2 text-xs rounded-xl border font-medium transition-all ${
                    isBooked
                      ? "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-600 cursor-not-allowed line-through"
                      : isSelected
                      ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  }`}
                >
                  {slot}
                  {isBooked && <span className="block text-[9px] text-gray-300">Booked</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Appointment Type */}
      <div>
        <label className="input-label">Appointment Type</label>
        <div className="grid grid-cols-3 gap-2">
          {["In-Person", "Video", "Phone"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, type: t }))}
              className={`py-2.5 px-3 text-xs rounded-xl border font-medium transition-all ${
                form.type === t
                  ? "bg-primary-600 text-white border-primary-600"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-600"
              }`}
            >
              {t === "In-Person" ? "🏥" : t === "Video" ? "📹" : "📞"} {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="btn-outline flex-1"
        >
          <FiChevronLeft size={16} /> Back
        </button>
        <button
          type="button"
          disabled={!form.appointmentDate || !form.timeSlot}
          onClick={() => setStep(3)}
          className="btn-primary flex-1"
        >
          Continue <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  // ── Step 3: Confirm ────────────────────────────────────────────────────────
  const renderStep3 = () => (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Summary Card */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 space-y-3 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Appointment Summary</h3>
        <div className="flex items-center gap-3">
          <img
            src={selectedDoctor?.user?.avatar?.url || "/default-avatar.png"}
            alt="Doctor"
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              Dr. {selectedDoctor?.user?.firstName} {selectedDoctor?.user?.lastName}
            </p>
            <p className="text-primary-600 text-xs">{selectedDoctor?.specialization}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Date</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {new Date(form.appointmentDate).toLocaleDateString("en-US", {
                weekday: "short", month: "long", day: "numeric", year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Time</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{form.timeSlot}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Type</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{form.type}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Consultation Fee</p>
            <p className="text-sm font-semibold text-green-600">${selectedDoctor?.consultationFee}</p>
          </div>
        </div>
      </div>

      {/* Reason */}
      <div>
        <label className="input-label">
          Reason for Visit <span className="text-red-400">*</span>
        </label>
        <textarea
          name="reason"
          value={form.reason}
          onChange={handleChange}
          rows={4}
          maxLength={500}
          className="input-field resize-none"
          placeholder="Describe your symptoms or reason for the appointment..."
          required
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{form.reason.length}/500</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="btn-outline flex-1"
        >
          <FiChevronLeft size={16} /> Back
        </button>
        <button
          type="submit"
          disabled={submitting || !form.reason.trim()}
          className="btn-primary flex-1"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Booking...
            </>
          ) : (
            <>
              <FiCheckCircle size={16} />
              Confirm Booking
            </>
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book an Appointment</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Schedule a visit with one of our verified specialists
        </p>
      </div>

      <StepIndicator current={step} />

      <div className="card">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default BookAppointment;
