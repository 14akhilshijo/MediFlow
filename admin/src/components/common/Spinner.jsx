const Spinner = ({ fullScreen = false, size = "md" }) => {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
  };

  const spinner = (
    <div
      className={`${sizes[size]} border-primary-200 border-t-primary-600 rounded-full animate-spin dark:border-primary-800 dark:border-t-primary-400`}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <p className="text-sm text-gray-500 dark:text-dark-muted font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  return <div className="flex justify-center py-10">{spinner}</div>;
};

export default Spinner;
