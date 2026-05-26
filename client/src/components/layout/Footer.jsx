import { Link } from "react-router-dom";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";

const Footer = () => (
  <footer className="bg-primary-900 text-white mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-1 mb-4">
            <span className="text-2xl font-bold text-white">Medi</span>
            <span className="text-2xl font-bold text-accent-400">Flow</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
            Smart Healthcare Management Platform connecting patients with the best
            doctors for seamless, quality healthcare.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            {[
              { label: "Home", to: "/" },
              { label: "Doctors", to: "/doctors" },
              { label: "Departments", to: "/departments" },
              { label: "About Us", to: "/about" },
              { label: "Contact", to: "/contact" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-accent-400 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-white mb-4">Contact</h4>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <FiPhone size={14} className="text-accent-400 shrink-0" />
              +1 (800) 123-4567
            </li>
            <li className="flex items-center gap-2">
              <FiMail size={14} className="text-accent-400 shrink-0" />
              support@mediflow.com
            </li>
            <li className="flex items-start gap-2">
              <FiMapPin size={14} className="text-accent-400 shrink-0 mt-0.5" />
              123 Health Ave, Medical City, MC 45678
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-700 mt-10 pt-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} MediFlow. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
