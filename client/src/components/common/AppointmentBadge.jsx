const config = {
  Pending:   { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",   dot: "bg-amber-500" },
  Confirmed: { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",       dot: "bg-blue-500" },
  Completed: { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", dot: "bg-emerald-500" },
  Cancelled: { cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",       dot: "bg-rose-500" },
  "No-Show": { cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",          dot: "bg-gray-400" },
};

const AppointmentBadge = ({ status }) => {
  const { cls, dot } = config[status] || config["No-Show"];
  return (
    <span className={`badge ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
};

export default AppointmentBadge;
