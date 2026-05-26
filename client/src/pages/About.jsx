const About = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <h1 className="section-title text-center">About MediFlow</h1>
    <p className="section-subtitle text-center">Transforming healthcare, one appointment at a time.</p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Mission</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          MediFlow is dedicated to making quality healthcare accessible to everyone. We connect
          patients with experienced doctors across all specialties, enabling seamless appointment
          booking, digital health records, and real-time consultations.
        </p>
      </div>
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Vision</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          We envision a world where geography and logistics never stand between a patient and
          the care they need. Through technology, we're building the future of smart, connected
          healthcare management.
        </p>
      </div>
    </div>
  </div>
);

export default About;
