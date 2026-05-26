const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {Icon && (
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-dark-border flex items-center justify-center mb-4">
        <Icon size={24} className="text-gray-400 dark:text-dark-muted" />
      </div>
    )}
    <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-gray-400 dark:text-dark-muted max-w-xs">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
