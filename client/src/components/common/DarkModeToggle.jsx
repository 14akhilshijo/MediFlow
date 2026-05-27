/**
 * DarkModeToggle
 *
 * A pill-shaped toggle button that switches between light and dark mode.
 * Reads and writes theme state via ThemeContext (persisted to localStorage).
 *
 * Props:
 *   compact  – boolean  – renders a smaller icon-only button (default: false)
 *   className – string  – extra classes for the outer element
 */

import { useTheme } from "../../context/ThemeContext.jsx";
import { FiSun, FiMoon } from "react-icons/fi";

const DarkModeToggle = ({ compact = false, className = "" }) => {
  const { dark, toggle } = useTheme();

  if (compact) {
    return (
      <button
        onClick={toggle}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        title={dark ? "Light mode" : "Dark mode"}
        className={`theme-toggle ${className}`}
      >
        {dark ? (
          <FiSun size={18} className="text-amber-400" />
        ) : (
          <FiMoon size={18} className="text-gray-500" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
        border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-900
        text-gray-600 dark:text-gray-300
        hover:bg-gray-50 dark:hover:bg-gray-800
        hover:border-gray-300 dark:hover:border-gray-600
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-950
        select-none
        ${className}
      `}
    >
      {/* Track */}
      <span
        className={`
          relative inline-flex w-9 h-5 rounded-full transition-colors duration-300 shrink-0
          ${dark ? "bg-primary-600" : "bg-gray-200"}
        `}
      >
        {/* Thumb */}
        <span
          className={`
            absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm
            transition-transform duration-300 ease-in-out
            flex items-center justify-center
            ${dark ? "translate-x-4" : "translate-x-0"}
          `}
        >
          {dark
            ? <FiMoon size={9} className="text-primary-600" />
            : <FiSun  size={9} className="text-amber-500" />
          }
        </span>
      </span>
      <span className="hidden sm:inline">
        {dark ? "Dark" : "Light"}
      </span>
    </button>
  );
};

export default DarkModeToggle;
