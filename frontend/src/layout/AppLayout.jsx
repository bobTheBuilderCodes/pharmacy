import { Link, NavLink, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/medicines", label: "Medicines" },
  { to: "/sales", label: "Sales POS" },
  { to: "/suppliers", label: "Suppliers" },
  { to: "/purchases", label: "Purchases" },
  { to: "/reports", label: "Reports" }
];

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-800/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-lg font-bold text-brand-600 dark:text-brand-100">
            Pharmacy Manager
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={handleLogout} className="button-muted" type="button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[220px_1fr]">
        <aside className="card h-fit">
          <p className="mb-4 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {user?.name} ({user?.role})
          </p>
          <nav className="grid gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm ${
                    isActive
                      ? "bg-brand-100 text-brand-700 dark:bg-brand-700 dark:text-brand-50"
                      : "hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`
                }
                end={item.to === "/"}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
