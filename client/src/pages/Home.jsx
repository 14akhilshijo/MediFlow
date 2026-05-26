import { Link } from "react-router-dom";
import { FiCalendar, FiUsers, FiAward, FiClock } from "react-icons/fi";
import useFetch from "../hooks/useFetch.js";
import DoctorCard from "../components/common/DoctorCard.jsx";
import Spinner from "../components/common/Spinner.jsx";

const stats = [
  { icon: FiUsers, label: "Patients Served", value: "50,000+" },
  { icon: FiAward, label: "Expert Doctors", value: "200+" },
  { icon: FiCalendar, label: "Appointments", value: "100,000+" },
  { icon: FiClock, label: "Years of Service", value: "15+" },
];

const Home = () => {
  const { data, loading } = useFetch("/api/v1/doctors?limit=4");

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Your Health, <br />
            <span className="text-accent-400">Our Priority</span>
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto mb-10">
            MediFlow connects you with top-rated doctors across all specialties.
            Book appointments instantly, manage your health records, and get
            quality care from the comfort of your home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/book-appointment" className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
              Book Appointment
            </Link>
            <Link to="/doctors" className="border border-white text-white hover:bg-white/10 font-semibold py-3 px-8 rounded-lg transition-colors">
              Find Doctors
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-xl mb-3">
                  <Icon size={22} className="text-primary-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title">Our Top Doctors</h2>
            <p className="section-subtitle">Experienced specialists ready to help you</p>
          </div>
          {loading ? (
            <Spinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data?.doctors?.map((doc) => (
                <DoctorCard key={doc._id} doctor={doc} />
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/doctors" className="btn-outline">
              View All Doctors
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to take control of your health?</h2>
          <p className="text-primary-100 mb-8">
            Join thousands of patients who trust MediFlow for their healthcare needs.
          </p>
          <Link to="/register" className="bg-white text-primary-700 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
            Get Started Free
          </Link>
        </div>
      </section>
    </>
  );
};

export default Home;
