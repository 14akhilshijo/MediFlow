
import { useEffect, useState, useRef } from "react";
import {
  FiCalendar, FiClock, FiCheckCircle, FiXCircle,
  FiUsers, FiActivity, FiTrendingUp, FiFileText,
  FiArrowUpRight, FiArrowDownRight, FiRefreshCw,
  FiStar, FiAward,
} from "react-icons/fi";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { analyticsAPI, adminMessageAPI } from "../services/adminApi.js";
import Spinner from "../components/common/Spinner.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const useCountUp = (target, duration = 900) => {
  const [value, setValue] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (target === null || target === undefined) return;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); 
      setValue(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
};

const StatCard = ({ icon: Icon, label, value, change, sub, iconBg, delay = 0 }) => {
  const animated = useCountUp(value);
  const isPositive = change >= 0;
  return (
    <div
      className="stat-card group animate-fade-in"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${iconBg}`}>
        <Icon size={21} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums leading-none">
          {value !== null && value !== undefined
            ? animated.toLocaleString()
            : <span className="skeleton w-14 h-7 inline-block rounded-lg" />}
        </p>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1 truncate">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">{sub}</p>}
      </div>
      {change !== undefined && change !== null && (
        <div className={`flex flex-col items-end gap-0.5 shrink-0 ${
          isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
        }`}>
          <div className="flex items-center gap-0.5 text-xs font-bold">
            {isPositive ? <FiArrowUpRight size={13} /> : <FiArrowDownRight size={13} />}
            {Math.abs(change)}%
          </div>
          <span className="text-[10px] text-gray-400 dark:text-dark-muted font-normal">vs last mo.</span>
        </div>
      )}
    </div>
  );
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl shadow-card-hover px-4 py-3 text-sm min-w-[130px]">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2 text-xs uppercase tracking-wide">
        {label}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-gray-500 dark:text-dark-muted">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-semibold tabular-nums" style={{ color: p.color }}>
            {typeof p.value === "number" && p.name.toLowerCase().includes("revenue")
              ? `₹${p.value.toLocaleString()}`
              : p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

const ChartCard = ({ title, subtitle, badge, children, className = "" }) => (
  <div className={`card ${className}`}>
    <div className="flex items-start justify-between mb-5 gap-3">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">{subtitle}</p>}
      </div>
      {badge && (
        <span className="badge bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shrink-0 text-[11px]">
          {badge}
        </span>
      )}
    </div>
    {children}
  </div>
);

const STATUS_STYLES = {
  Pending:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "No-Show": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};
const StatusPill = ({ status }) => (
  <span className={`badge ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>
);

const DonutLabel = ({ viewBox, total }) => {
  const { cx, cy } = viewBox;
  return (
    <>
      <text x={cx} y={cy - 8} textAnchor="middle" className="fill-gray-900 dark:fill-white" fontSize={22} fontWeight={700}>
        {total?.toLocaleString()}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="fill-gray-400" fontSize={11}>
        total
      </text>
    </>
  );
};

const ProgressBar = ({ pct, color }) => (
  <div className="w-full bg-gray-100 dark:bg-dark-border rounded-full h-1.5 overflow-hidden">
    <div
      className="h-full rounded-full transition-all duration-700 ease-out"
      style={{ width: `${pct}%`, background: color }}
    />
  </div>
);

const Dashboard = () => {
  const { dark } = useTheme();

  const [overview,     setOverview]     = useState(null);
  const [trend,        setTrend]        = useState([]);
  const [statusData,   setStatusData]   = useState([]);
  const [departments,  setDepartments]  = useState([]);
  const [topDoctors,   setTopDoctors]   = useState([]);
  const [patientGrowth, setPatientGrowth] = useState([]);
  const [unreadMsgs,   setUnreadMsgs]   = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [error,        setError]        = useState(null);

  const loadAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [ovRes, trendRes, statusRes, deptRes, docRes, growthRes, msgRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getMonthlyTrend(),
        analyticsAPI.getStatusBreakdown(),
        analyticsAPI.getDepartments(),
        analyticsAPI.getTopDoctors(),
        analyticsAPI.getPatientGrowth(),
        adminMessageAPI.getAll(),
      ]);
      setOverview(ovRes.data.overview);
      setTrend(trendRes.data.trend || []);
      setStatusData(statusRes.data.breakdown || []);
      setDepartments(deptRes.data.departments || []);
      setTopDoctors(docRes.data.doctors || []);
      setPatientGrowth(growthRes.data.growth || []);
      const msgs = msgRes.data.messages || [];
      setUnreadMsgs(msgs.filter((m) => !m.isRead).length);
    } catch (err) {
      setError(err.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const axisColor  = dark ? "#475569" : "#9ca3af";
  const gridColor  = dark ? "#1e293b" : "#f1f5f9";
  const ov         = overview;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Spinner />
        <p className="text-sm text-gray-400 dark:text-dark-muted animate-pulse">Loading analytics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={() => loadAll()} className="btn-secondary text-sm">
          <FiRefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const trendDisplay = trend.slice(-6);

  return (
    <div className="space-y-6">

      { }
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time analytics overview</p>
        </div>
        <button
          onClick={() => loadAll(true)}
          disabled={refreshing}
          className="btn-secondary gap-2 text-sm"
          title="Refresh data"
        >
          <FiRefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      { }
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={FiCalendar}
          label="Total Appointments"
          value={ov?.appointments.total}
          change={ov?.appointments.change}
          sub={`${ov?.appointments.thisMonth ?? 0} this month`}
          iconBg="bg-primary-600"
          delay={0}
        />
        <StatCard
          icon={FiUsers}
          label="Total Patients"
          value={ov?.patients.total}
          change={ov?.patients.change}
          sub={`${ov?.patients.thisMonth ?? 0} new this month`}
          iconBg="bg-pink-500"
          delay={60}
        />
        <StatCard
          icon={FiActivity}
          label="Active Doctors"
          value={ov?.doctors.active}
          sub={`${ov?.doctors.total ?? 0} total registered`}
          iconBg="bg-indigo-500"
          delay={120}
        />
        <StatCard
          icon={FiFileText}
          label="Medical Reports"
          value={ov?.reports.total}
          iconBg="bg-teal-500"
          delay={180}
        />
        <StatCard
          icon={FiClock}
          label="Pending"
          value={ov?.appointments.pending}
          iconBg="bg-amber-500"
          delay={240}
        />
        <StatCard
          icon={FiCheckCircle}
          label="Completed"
          value={ov?.appointments.completed}
          iconBg="bg-emerald-500"
          delay={300}
        />
        <StatCard
          icon={FiTrendingUp}
          label="Confirmed"
          value={ov?.appointments.confirmed}
          iconBg="bg-cyan-500"
          delay={360}
        />
        <StatCard
          icon={FiXCircle}
          label="Cancelled"
          value={ov?.appointments.cancelled}
          iconBg="bg-red-500"
          delay={420}
        />
      </div>

      { }
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        { }
        <ChartCard
          title="Monthly Appointment Trend"
          subtitle="Appointments & completions over the last 6 months"
          badge="Last 6 Months"
          className="xl:col-span-2"
        >
          {trendDisplay.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendDisplay} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                <Area type="monotone" dataKey="total"     name="Total"     stroke="#2563eb" strokeWidth={2.5} fill="url(#gTotal)"     dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2.5} fill="url(#gCompleted)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="cancelled" name="Cancelled" stroke="#ef4444" strokeWidth={1.5} fill="none"             dot={false} activeDot={{ r: 4, strokeWidth: 0 }} strokeDasharray="4 3" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 dark:text-dark-muted text-sm">
              No appointment data yet
            </div>
          )}
        </ChartCard>

        { }
        <ChartCard title="Status Breakdown" subtitle="All-time distribution">
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={85}
                    paddingAngle={3}
                    labelLine={false}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} />
                    ))}
                    <DonutLabel total={ov?.appointments.total} />
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5 mt-3">
                {statusData.map((s) => (
                  <div key={s.status}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-medium">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                        {s.status}
                      </span>
                      <span className="tabular-nums text-gray-500 dark:text-dark-muted">
                        {s.count} · {s.pct}%
                      </span>
                    </div>
                    <ProgressBar pct={s.pct} color={s.color} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 dark:text-dark-muted text-sm">
              No data yet
            </div>
          )}
        </ChartCard>
      </div>

      { }
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        { }
        <ChartCard title="Appointments by Department" subtitle="Top departments by volume">
          {departments.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={departments}
                layout="vertical"
                barSize={14}
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: axisColor }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: dark ? "#1e293b" : "#f8fafc" }} />
                <Bar dataKey="total"     name="Total"     fill="#2563eb" radius={[0, 6, 6, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 dark:text-dark-muted text-sm">
              No department data yet
            </div>
          )}
        </ChartCard>

        { }
        <ChartCard title="New Patient Registrations" subtitle="Monthly growth over last 6 months" badge="6 Months">
          {patientGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={patientGrowth} barSize={28} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gPatient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#ec4899" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: dark ? "#1e293b" : "#f8fafc" }} />
                <Bar dataKey="count" name="New Patients" fill="url(#gPatient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 dark:text-dark-muted text-sm">
              No patient data yet
            </div>
          )}
        </ChartCard>
      </div>

      { }
      <ChartCard title="Top Doctors" subtitle="Ranked by total appointments">
        {topDoctors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border">
                  <th className="table-th pl-0">#</th>
                  <th className="table-th">Doctor</th>
                  <th className="table-th">Department</th>
                  <th className="table-th text-center">Total</th>
                  <th className="table-th text-center">Completed</th>
                  <th className="table-th text-center">Rating</th>
                  <th className="table-th text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                {topDoctors.map((doc, i) => (
                  <tr key={doc.doctorId} className="table-row">
                    <td className="table-td pl-0">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                        i === 1 ? "bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-gray-300" :
                        i === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                        "bg-gray-50 text-gray-400 dark:bg-dark-bg dark:text-dark-muted"
                      }`}>
                        {i === 0 ? <FiAward size={13} /> : i + 1}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        {doc.avatar ? (
                          <img src={doc.avatar} alt={doc.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {doc.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            Dr. {doc.name}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-dark-muted truncate">{doc.specialization}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-gray-500 dark:text-dark-muted text-sm">{doc.department}</td>
                    <td className="table-td text-center">
                      <span className="font-bold text-gray-900 dark:text-white tabular-nums">{doc.total}</span>
                    </td>
                    <td className="table-td text-center">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{doc.completed}</span>
                    </td>
                    <td className="table-td text-center">
                      <span className="flex items-center justify-center gap-1 text-amber-500 font-semibold text-sm">
                        <FiStar size={12} className="fill-amber-400 stroke-amber-400" />
                        {doc.rating > 0 ? doc.rating.toFixed(1) : "—"}
                      </span>
                    </td>
                    <td className="table-td text-right">
                      <span className={`badge ${doc.isVerified ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-dark-border dark:text-dark-muted"}`}>
                        {doc.isVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-400 dark:text-dark-muted text-sm">
            No appointment data yet
          </div>
        )}
      </ChartCard>

    </div>
  );
};

export default Dashboard;
