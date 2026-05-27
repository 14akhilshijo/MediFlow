import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiUser, FiLogOut, FiCalendar, FiClock } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import DarkModeToggle from "../common/DarkModeToggle.jsx";
import toast from "react-hot-toast";

const navLinks = [
  { label: "Home",        to: "/" },
  { label: "Doctors",     to: "/doctors" },
  { label: "Departments", to: "/departments" },
  { label: "About",       to: "/about" },
  { label: "Contact",     to: "/contact" },
];

// Role-based dashboard paths
const getDashboardPath = (role) => {
  if (role === "Doctor") return "/doctor/dashboard";
  return "/dashboard";
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = getDashboardPath(user?.role);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully.");
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-0.5 shrink-0">
            <span className="text-2xl font-bold text-primary-600">Medi</span>
            <span className="text-2xl font-bold text-accent-500">Flow</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Doctor-specific nav links */}
            {user?.role === "Doctor" && (
              <>
                <NavLink
                  to="/doctor/appointments"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors flex items-center gap-1 ${
                      isActive
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                    }`
                  }
                >
                  <FiCalendar size={13} /> Appointments
                </NavLink>
                <NavLink
                  to="/doctor/schedule"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors flex items-center gap-1 ${
                      isActive
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                    }`
                  }
                >
                  <FiClock size={13} /> Schedule
                </NavLink>
              </>
            )}
          </nav>

          {/* Right side: toggle + auth */}
          <div className="hidden md:flex items-center gap-3">
            <DarkModeToggle compact />

            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <FiUser size={16} />
                  {user.role === "Doctor" ? `Dr. ${user.firstName}` : user.firstName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  <FiLogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn-outline text-sm py-2 px-4">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Register</Link>
              </>
            )}
          </div>

          {/* Mobile: toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <DarkModeToggle compact />
            <button
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-4 space-y-1 animate-slide-down">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {/* Doctor mobile links */}
          {user?.role === "Doctor" && (
            <>
              <NavLink
                to="/doctor/appointments"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`
                }
              >
                Appointments
              </NavLink>
              <NavLink
                to="/doctor/schedule"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`
                }
              >
                Schedule
              </NavLink>
            </>
          )}

          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setMenuOpen(false)}
                  className="btn-outline text-sm text-center"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-500 dark:text-red-400 font-medium text-left px-3 py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    onClick={() => setMenuOpen(false)} className="btn-outline text-sm text-center">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm text-center">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
