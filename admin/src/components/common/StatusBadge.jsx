const config = {
  Pending:    { dot: "bg-yellow-400",  bg: "bg-yellow-50  dark:bg-yellow-900/20",  text: "text-yellow-700  dark:text-yellow-400"  },
  Confirmed:  { dot: "bg-blue-400",    bg: "bg-blue-50    dark:bg-blue-900/20",    text: "text-blue-700    dark:text-blue-400"    },
  Completed:  { dot: "bg-green-400",   bg: "bg-green-50   dark:bg-green-900/20",   text: "text-green-700   dark:text-green-400"   },
  Cancelled:  { dot: "bg-red-400",     bg: "bg-red-50     dark:bg-red-900/20",     text: "text-red-700     dark:text-red-400"     },
  "No-Show":  { dot: "bg-gray-400",    bg: "bg-gray-100   dark:bg-gray-800",       text: "text-gray-600    dark:text-gray-400"    },
  Active:     { dot: "bg-green-400",   bg: "bg-green-50   dark:bg-green-900/20",   text: "text-green-700   dark:text-green-400"   },
  Inactive:   { dot: "bg-red-400",     bg: "bg-red-50     dark:bg-red-900/20",     text: "text-red-700     dark:text-red-400"     },
  Verified:   { dot: "bg-blue-400",    bg: "bg-blue-50    dark:bg-blue-900/20",    text: "text-blue-700    dark:text-blue-400"    },
  Unverified: { dot: "bg-orange-400",  bg: "bg-orange-50  dark:bg-orange-900/20",  text: "text-orange-700  dark:text-orange-400"  },
  Paid:       { dot: "bg-green-400",   bg: "bg-green-50   dark:bg-green-900/20",   text: "text-green-700   dark:text-green-400"   },
  Refunded:   { dot: "bg-purple-400",  bg: "bg-purple-50  dark:bg-purple-900/20",  text: "text-purple-700  dark:text-purple-400"  },
};

const StatusBadge = ({ label }) => {
  const style = config[label] ?? {
    dot: "bg-gray-400",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
  };

  return (
    <span className={`badge ${style.bg} ${style.text}`}>
      <span className={`status-dot ${style.dot}`} />
      {label}
    </span>
  );
};

export default StatusBadge;
