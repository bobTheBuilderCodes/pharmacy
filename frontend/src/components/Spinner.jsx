const Spinner = ({ size = "md" }) => {
  const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-10 w-10" : "h-6 w-6";

  return (
    <span
      className={`inline-block ${sizeClass} animate-spin rounded-full border-2 border-slate-300 border-t-brand-600 dark:border-slate-600 dark:border-t-brand-300`}
      aria-label="Loading"
    />
  );
};

export default Spinner;
