import { useEffect, useState } from "react";
import {
  FiCalendar, FiClock, FiCheckCircle, FiXCircle,
  FiUsers, FiActivity, FiTrendingUp, FiAlertCircle,
  FiArrowUpRight, FiArrowDownRight,
} from "react-icons/fi";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import { adminAppointmentAPI, adminDoctorAPI, adminUserAPI, adminMessageAPI } from "../services/adminApi.js";
import Spinner from "../components/common/Spinner.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

/* ── Stat Card ─────────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, change, changeLabel, gradient, iconBg }) => {
  const isPositive = change >= 0;
  return (
    <div className="stat-card group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
          {value ?? <span className="skeleton w-12 h-7 inline-block rounded" />}
        </p>
        <p className="text-sm text-gray-500 dark:text-dark-muted truncate">{label}</p>
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-semibold shrink-0 ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
          {isPositive ? <FiArrowUpRight size={14} /> : <FiArrowDownRight size={14} />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
  );
};

/* ── Custom Tooltip ─────────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: <span className="tabular-nums">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

/* ── Pie colors ─────────────────────────────────────────────────────────────── */
const PIE_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6"];

/* ── Mock trend data (last 7 days) ─────────────────────────────────────────── */
const generateTrend = (stats) => {
  if (!stats) return [];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day, i) => ({
    day,
    appointments: Math.max(1, Math.round((stats.total / 7) * (0.6 + Math.random() * 0.8))),
    completed:    Math.max(0, Math.round((stats.completed / 7) * (0.5 + Math.random() * 1.0))),
  }));
};

/* ── Dashboard ──────────────────────────────────────────────────────────────── */
const Dashboard = () => {
  const { dark } = useTheme();
  const [stats, setStats]           = useState(null);
  const [doctorCount, setDoctorCount] = useState(null);
  const [userCount, setUserCount]   = useState(null);
  const [recentAppts, setRecentAppts] = useState([]);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, doctorsRes, usersRes, apptRes, msgRes] = await Promise.all([
          adminAppointmentAPI.getStats(),
          adminDoctorAPI.getAll(),
          adminUserAPI.getAll(),
          adminAppointmentAPI.getAll({ limit: 5, sort: "-createdAt" }),
          adminMessageAPI.getAll(),
        ]);
        setStats(statsRes.data.stats);
        setDoctorCount(doctorsRes.data.count ?? doctorsRes.data.doctors?.length);
        setUserCount(usersRes.data.total ?? usersRes.data.users?.length);
        setRecentAppts((apptRes.data.appointments ?? []).slice(0, 5));
        const msgs = msgRes.data.messages ?? [];
        setUnreadMsgs(msgs.filter((m) => !m.isRead).length);
      } catch {
        // silently fail – show empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner />;

  const barData = stats
    ? [
        { name: "Pending",   value: stats.pending,   fill: "#f59e0b" },
        { name: "Confirmed", value: stats.confirmed, fill: "#3b82f6" },
        { name: "Completed", value: stats.completed, fill: "#10b981" },
        { name: "Cancelled", value: stats.cancelled, fill: "#ef4444" },
      ]
    : [];

  const pieData = barData.filter((d) => d.value > 0);
  const trendData = generateTrend(stats);

  const axisColor = dark ? "#475569" : "#9ca3af";
  const gridColor = dark ? "#1e293b" : "#f3f4f6";

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={FiCalendar}
          label="Total Appointments"
          value={stats?.total}
          change={12}
          iconBg="bg-primary-600"
        />
        <StatCard
          icon={FiClock}
          label="Pending Requests"
          value={stats?.pending}
          change={-3}
          iconBg="bg-amber-500"
        />
        <StatCard
          icon={FiCheckCircle}
          label="Completed"
          value={stats?.completed}
          change={8}
          iconBg="bg-emerald-500"
        />
        <StatCard
          icon={FiXCircle}
          label="Cancelled"
          value={stats?.cancelled}
          change={-5}
          iconBg="bg-red-500"
        />
        <StatCard
          icon={FiActivity}
          label="Total Doctors"
          value={doctorCount}
          iconBg="bg-indigo-500"
        />
        <StatCard
          icon={FiUsers}
          label="Total Patients"
          value={userCount}
          change={15}
          iconBg="bg-pink-500"
        />
        <StatCard
          icon={FiAlertCircle}
          label="Unread Messages"
          value={unreadMsgs}
          iconBg="bg-violet-500"
        />
        <StatCard
          icon={FiTrendingUp}
          label="Confirmed"
          value={stats?.confirmed}
          change={6}
          iconBg="bg-cyan-500"
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Area Chart – Weekly Trend */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Weekly Appointment Trend</h2>
              <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">Last 7 days overview</p>
            </div>
            <span className="badge bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
              This Week
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradAppt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="appointments" name="Total" stroke="#2563eb" strokeWidth={2.5} fill="url(#gradAppt)" dot={false} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="completed"    name="Completed" stroke="#10b981" strokeWidth={2.5} fill="url(#gradComp)" dot={false} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart – Status Distribution */}
        <div className="card">
          <div className="mb-6">
            <h2 className="section-title">Status Distribution</h2>
            <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">All-time breakdown</p>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 dark:text-dark-muted text-sm">
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* ── Bar Chart + Recent Appointments ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Bar Chart */}
        <div className="card">
          <div className="mb-6">
            <h2 className="section-title">Appointment Overview</h2>
            <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">By status</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={32} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: dark ? "#1e293b" : "#f8fafc" }} />
              <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                {barData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Appointments */}
        <div className="xl:col-span-2 card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
            <div>
              <h2 className="section-title">Recent Appointments</h2>
              <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">Latest 5 bookings</p>
            </div>
          </div>
          {recentAppts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-bg/50">
                  <tr>
                    <th className="table-th">Patient</th>
                    <th className="table-th">Doctor</th>
                    <th className="table-th">Date</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                  {recentAppts.map((appt) => (
                    <tr key={appt._id} className="table-row">
                      <td className="table-td font-medium">
                        {appt.patient?.firstName} {appt.patient?.lastName}
                      </td>
                      <td className="table-td text-gray-500 dark:text-dark-muted">
                        Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName}
                      </td>
                      <td className="table-td text-gray-500 dark:text-dark-muted">
                        {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </td>
                      <td className="table-td">
                        <StatusBadge label={appt.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400 dark:text-dark-muted text-sm">
              No recent appointments
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
