import { useState } from "react";
import { FiMenu, FiBell, FiSun, FiMoon, FiSearch } from "react-icons/fi";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useLocation } from "react-router-dom";

const routeTitles = {
  "/":             { title: "Dashboard",    subtitle: "Welcome back, here's what's happening today." },
  "/doctors":      { title: "Doctors",      subtitle: "Manage your medical staff." },
  "/doctors/add":  { title: "Add Doctor",   subtitle: "Register a new doctor to the system." },
  "/appointments": { title: "Appointments", subtitle: "View and manage all patient appointments." },
  "/users":        { title: "Patients",     subtitle: "Manage registered patients." },
  "/departments":  { title: "Departments",  subtitle: "Manage hospital departments." },
  "/messages":     { title: "Messages",     subtitle: "Patient and visitor inquiries." },
};

const Topbar = ({ onMenuClick }) => {
  const { admin } = useAdminAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  const meta = routeTitles[location.pathname] ?? { title: "MediFlow", subtitle: "" };

  return (
    <header className="h-16 bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border px-6 flex items-center justify-between gap-4 shrink-0">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="btn-icon lg:hidden"
          aria-label="Open sidebar"
        >
          <FiMenu size={20} />
        </button>

        <div className="hidden sm:block min-w-0">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {meta.title}
          </h1>
          <p className="text-xs text-gray-400 dark:text-dark-muted truncate hidden md:block">
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: search, theme toggle, notifications, avatar */}
      <div className="flex items-center gap-2">
        {/* Search toggle (desktop) */}
        <div className="hidden md:flex items-center">
          {searchOpen ? (
            <div className="relative">
              <FiSearch
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                autoFocus
                onBlur={() => setSearchOpen(false)}
                placeholder="Search…"
                className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 w-56 transition-all"
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="btn-icon"
              aria-label="Search"
            >
              <FiSearch size={18} />
            </button>
          )}
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="btn-icon"
          aria-label="Toggle dark mode"
        >
          {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        {/* Notifications */}
        <button className="btn-icon relative" aria-label="Notifications">
          <FiBell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-dark-surface" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold text-white shadow-sm ml-1">
          {admin?.firstName?.[0]}{admin?.lastName?.[0]}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
