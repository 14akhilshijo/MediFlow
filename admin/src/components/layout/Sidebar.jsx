import { NavLink, useLocation } from "react-router-dom";
import {
  FiGrid, FiUsers, FiCalendar, FiMessageSquare,
  FiLayers, FiUserPlus, FiLogOut, FiActivity,
  FiChevronRight,
} from "react-icons/fi";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard",    to: "/",             icon: FiGrid },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Doctors",      to: "/doctors",      icon: FiActivity },
      { label: "Add Doctor",   to: "/doctors/add",  icon: FiUserPlus },
      { label: "Appointments", to: "/appointments", icon: FiCalendar },
      { label: "Patients",     to: "/users",        icon: FiUsers },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Departments",  to: "/departments",  icon: FiLayers },
      { label: "Messages",     to: "/messages",     icon: FiMessageSquare },
    ],
  },
];

const Sidebar = ({ onClose }) => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  const initials = admin
    ? `${admin.firstName?.[0] ?? ""}${admin.lastName?.[0] ?? ""}`.toUpperCase()
    : "A";

  return (
    <aside className="flex flex-col h-full w-64 bg-sidebar text-white select-none">
      {/* ── Logo ── */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-glow">
          <FiActivity size={16} className="text-white" />
        </div>
        <div>
          <span className="text-lg font-bold text-white">Medi</span>
          <span className="text-lg font-bold text-accent-400">Flow</span>
          <span className="ml-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Admin
          </span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "nav-link-active" : "nav-link-inactive"}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={17} className="shrink-0" />
                      <span className="flex-1">{label}</span>
                      {isActive && (
                        <FiChevronRight size={14} className="opacity-70" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Admin Profile + Logout ── */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate">
              {admin?.firstName} {admin?.lastName}
            </p>
            <p className="text-slate-400 text-xs">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-red-400 transition-colors w-full px-1 py-1.5 rounded-lg hover:bg-white/5"
        >
          <FiLogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
