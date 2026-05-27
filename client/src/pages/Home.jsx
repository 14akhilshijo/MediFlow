import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiUsers,
  FiShield,
  FiLock,
  FiHeadphones,
  FiArrowRight,
  FiCheckCircle,
  FiFileText,
  FiHeart,
  FiClock,
  FiStar,
} from "react-icons/fi";
import { HiOutlineUserGroup } from "react-icons/hi";
import useFetch from "../hooks/useFetch.js";
import Spinner from "../components/common/Spinner.jsx";

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
const getInitials = (firstName = "", lastName = "") =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

const getNextSlot = (availableSlots = []) => {
  const order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  if (!availableSlots.length) return null;
  const sorted = [...availableSlots]
    .filter((s) => s.isAvailable)
    .sort((a, b) => order.indexOf(a.day) - order.indexOf(b.day));
  return sorted[0] ?? null;
};

/* ─── Floating Cards ────────────────────────────────────────────────────────── */
const UpcomingCard = ({ doctor }) => {
  const user = doctor?.user ?? {};
  const firstName = user.firstName ?? "Sarah";
  const lastName  = user.lastName  ?? "Johnson";
  const spec      = doctor?.specialization ?? "Cardiologist";
  const slot      = getNextSlot(doctor?.availableSlots);
  const timeLabel = slot ? `${slot.day} · ${slot.startTime}` : "28 May · 10:30 AM";
  const avatarUrl = user.avatar?.url;
  const initials  = getInitials(firstName, lastName);

  return (
    <div className="absolute top-6 left-0 -translate-x-1/4 bg-white dark:bg-gray-900 rounded-2xl shadow-card-md p-4 w-56 z-10 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Upcoming Appointment</span>
        <FiCalendar size={14} className="text-primary-500" />
      </div>
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`Dr. ${firstName} ${lastName}`}
            className="w-9 h-9 rounded-full object-cover shrink-0 border-2 border-primary-100"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
            Dr. {firstName} {lastName}
          </p>
          <p className="text-xs text-gray-400">{spec}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
        <FiClock size={12} />
        <span>{timeLabel}</span>
      </div>
    </div>
  );
};

const MedicationCard = () => (
  <div className="absolute top-6 right-0 translate-x-1/4 bg-white dark:bg-gray-900 rounded-2xl shadow-card-md p-4 w-48 z-10 border border-gray-100 dark:border-gray-800">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
        <FiCheckCircle size={14} className="text-primary-600 dark:text-primary-400" />
      </div>
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Medication Reminder</span>
    </div>
    <p className="text-xs text-gray-400 mt-1">Take your medicine</p>
    <p className="text-xs text-gray-400">Today, 8:00 PM</p>
    <div className="mt-2 flex justify-end">
      <div className="w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center">
        <FiCheckCircle size={12} className="text-white" />
      </div>
    </div>
  </div>
);

const HealthRecordsCard = () => (
  <div className="absolute bottom-24 left-0 -translate-x-1/4 bg-white dark:bg-gray-900 rounded-2xl shadow-card-md p-4 w-48 z-10 border border-gray-100 dark:border-gray-800">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
          <FiFileText size={15} className="text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-900 dark:text-white">Health Records</p>
          <p className="text-xs text-gray-400">View your reports</p>
        </div>
      </div>
      <FiArrowRight size={14} className="text-gray-400" />
    </div>
  </div>
);

const HealthScoreCard = () => (
  <div className="absolute bottom-16 right-0 translate-x-1/4 bg-white dark:bg-gray-900 rounded-2xl shadow-card-md p-4 w-40 z-10 border border-gray-100 dark:border-gray-800">
    <div className="flex items-center gap-1 mb-2">
      <FiHeart size={13} className="text-rose-500" />
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Health Score</span>
    </div>
    <div className="flex items-end gap-2">
      <span className="text-2xl font-bold text-gray-900 dark:text-white">85%</span>
      <span className="text-xs text-accent-500 font-semibold mb-1">Great!</span>
    </div>
    <p className="text-xs text-gray-400">Keep it up</p>
    <svg viewBox="0 0 60 20" className="w-full mt-2 text-accent-500" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="0,18 10,14 20,16 30,10 40,12 50,6 60,8" />
    </svg>
  </div>
);

/* ─── Doctor Card ───────────────────────────────────────────────────────────── */
const DoctorHeroCard = ({ doctor }) => {
  const user      = doctor?.user ?? {};
  const firstName = user.firstName ?? "";
  const lastName  = user.lastName  ?? "";
  const avatarUrl = user.avatar?.url;
  const initials  = getInitials(firstName, lastName);
  const rating    = doctor?.rating?.average ?? 0;
  const dept      = doctor?.department?.name ?? "";
  const spec      = doctor?.specialization ?? "";
  const exp       = doctor?.experience ?? 0;
  const fee       = doctor?.consultationFee ?? 0;

  return (
    <Link
      to={`/doctors/${doctor._id}`}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card hover:shadow-card-md hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Avatar */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-950 dark:to-blue-950 p-6 flex justify-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`Dr. ${firstName} ${lastName}`}
            className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-gray-800 shadow-md">
            {initials}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 dark:text-white text-center text-sm leading-tight">
          Dr. {firstName} {lastName}
        </h3>
        <p className="text-xs text-primary-600 dark:text-primary-400 font-medium text-center mt-0.5">{spec}</p>
        {dept && (
          <p className="text-xs text-gray-400 text-center mt-0.5">{dept}</p>
        )}

        {/* Rating + exp */}
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="flex items-center gap-1">
            <FiStar size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{rating.toFixed(1)}</span>
          </div>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{exp} yrs exp</span>
        </div>

        {/* Fee + Book */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Consultation</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">₹{fee}</p>
          </div>
          <span className="text-xs bg-primary-600 hover:bg-primary-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">
            Book
          </span>
        </div>
      </div>
    </Link>
  );
};

/* ─── Features row ──────────────────────────────────────────────────────────── */
const features = [
  {
    icon:  HiOutlineUserGroup,
    color: "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400",
    title: "Top Specialists",
    desc:  "Connect with leading doctors across all specialties.",
  },
  {
    icon:  FiCalendar,
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    title: "Easy Booking",
    desc:  "Book appointments in seconds with our smooth and intuitive system.",
  },
  {
    icon:  FiFileText,
    color: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
    title: "Health Records",
    desc:  "Access and manage your medical history and reports securely.",
  },
  {
    icon:  FiShield,
    color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    title: "Quality Care",
    desc:  "Receive the best care with personalized treatment plans.",
  },
];

/* ─── Trust badges ──────────────────────────────────────────────────────────── */
const trustBadges = [
  { icon: FiShield,     label: "Verified Doctors", sub: "Trusted & Experienced" },
  { icon: FiLock,       label: "Secure & Private",  sub: "Your data is safe"     },
  { icon: FiHeadphones, label: "24/7 Support",      sub: "We're here to help"    },
];

/* ─── Page Component ────────────────────────────────────────────────────────── */
const Home = () => {
  const { data: statsData }   = useFetch("/api/v1/public/stats");
  const { data: doctorsData, loading: doctorsLoading } = useFetch("/api/v1/doctors?limit=10&sort=-rating.average");

  const s       = statsData?.stats;
  const doctors = doctorsData?.doctors ?? [];

  // Hero card: show Dr. Vikram Singh specifically
  const featuredDoctor =
    doctors.find(
      (d) =>
        d.user?.firstName?.toLowerCase() === "vikram" &&
        d.user?.lastName?.toLowerCase() === "singh"
    ) ?? doctors[0] ?? null;

  // Top 4 for the doctor grid (exclude the featured hero doctor to avoid duplication)
  const gridDoctors = doctors
    .filter((d) => d._id !== featuredDoctor?._id)
    .slice(0, 4);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-16 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left – copy */}
            <div className="animate-slide-up">
              {/* Trust pill */}
              <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-1.5 mb-6 shadow-sm">
                <FiShield size={14} className="text-accent-500" />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Trusted Care, Anytime, Anywhere
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
                Better Health
                <br />
                <span className="text-accent-500">Starts</span>{" "}
                <span className="text-gray-900 dark:text-white">Here</span>
              </h1>

              <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-md mb-8">
                MediFlow connects you with top-rated doctors, books appointments
                instantly, and helps you manage your health — all in one place.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-4 mb-10">
                <Link
                  to="/book-appointment"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold py-3 px-7 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Book Appointment
                  <FiCalendar size={16} />
                </Link>
                <Link
                  to="/doctors"
                  className="inline-flex items-center gap-2 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 font-semibold py-3 px-7 rounded-xl transition-all duration-200 bg-white dark:bg-gray-900"
                >
                  Find Doctors
                  <FiUsers size={16} />
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6">
                {trustBadges.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                      <Icon size={15} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight">{label}</p>
                      <p className="text-xs text-gray-400">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – hero visual + floating cards */}
            <div className="relative flex justify-center items-center min-h-[420px] lg:min-h-[480px]">
              {/* Background blob */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 rounded-full bg-gradient-to-br from-primary-200 via-blue-200 to-cyan-200 dark:from-primary-900/40 dark:via-blue-900/30 dark:to-cyan-900/20 blur-3xl opacity-60" />
              </div>

              {/* Centre card — stylish doctor portrait */}
              <div className="relative z-0 w-72 h-[420px] rounded-3xl bg-gradient-to-br from-primary-400 via-blue-500 to-cyan-400 shadow-card-lg overflow-hidden">
                {/* Dot grid decoration */}
                <div className="absolute top-4 right-4 grid grid-cols-4 gap-1 opacity-30 z-10">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
                  ))}
                </div>
                {featuredDoctor?.user?.avatar?.url ? (
                  <img
                    src={featuredDoctor.user.avatar.url}
                    alt="Featured doctor"
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  /* Fallback — Vikram Singh's photo */
                  <img
                    src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=750&fit=crop&crop=top&q=90"
                    alt="Doctor"
                    className="w-full h-full object-cover object-top"
                  />
                )}
                {/* Subtle gradient overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-600/40 to-transparent" />
              </div>

              {/* Floating cards */}
              <UpcomingCard doctor={featuredDoctor} />
              <MedicationCard />
              <HealthRecordsCard />
              <HealthScoreCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features row ──────────────────────────────────────────────────── */}
      <section className="py-14 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Top Doctors ───────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Our Top Doctors
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Experienced specialists ready to help you
            </p>
          </div>

          {doctorsLoading ? (
            <Spinner />
          ) : gridDoctors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {gridDoctors.map((doc) => (
                <DoctorHeroCard key={doc._id} doctor={doc} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">No doctors available yet.</p>
          )}

          <div className="text-center mt-10">
            <Link
              to="/doctors"
              className="inline-flex items-center gap-2 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-600 dark:hover:text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200"
            >
              View All Doctors
              <FiArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      {s && (
        <section className="py-12 bg-gradient-to-r from-primary-600 to-primary-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { label: "Patients Served",  value: s.patientsServed  },
                { label: "Expert Doctors",   value: s.expertDoctors   },
                { label: "Appointments",     value: s.appointments    },
                { label: "Years of Service", value: s.yearsOfService  },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-3xl font-extrabold">
                    {value != null
                      ? `${value >= 1000 ? Math.floor(value / 1000) * 1000 : value}+`
                      : "—"}
                  </div>
                  <div className="text-primary-100 text-sm mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to take control of your health?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Join thousands of patients who trust MediFlow for their healthcare needs.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            Get Started Free
            <FiArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
};

export default Home;
