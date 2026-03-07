const StatCard = ({ title, value, hint }) => (
  <div className="card">
    <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
    <p className="mt-1 text-2xl font-semibold">{value}</p>
    {hint ? <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
  </div>
);

export default StatCard;
