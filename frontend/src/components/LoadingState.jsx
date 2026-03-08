import Spinner from "./Spinner";

const LoadingState = ({ label = "Loading..." }) => (
  <div className="card flex min-h-40 items-center justify-center gap-3">
    <Spinner size="lg" />
    <p className="text-sm text-slate-600 dark:text-slate-300">{label}</p>
  </div>
);

export default LoadingState;
