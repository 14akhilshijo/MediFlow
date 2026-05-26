const Spinner = ({ fullScreen = false, size = "md", text = "" }) => {
  const sizes = { sm: "h-5 w-5 border-2", md: "h-9 w-9 border-[3px]", lg: "h-14 w-14 border-4" };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizes[size]} border-primary-200 border-t-primary-600 rounded-full animate-spin dark:border-primary-800 dark:border-t-primary-400`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center py-12">{spinner}</div>;
};

export default Spinner;
