import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/medicines", label: "Medicine" },
  { to: "/sales", label: "Sales POS" },
  { to: "/suppliers", label: "Suppliers" },
  { to: "/purchases", label: "Purchases" },
  { to: "/settings", label: "Settings" }
];

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const userInitials = useMemo(() => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  }, [user?.name]);

  useEffect(() => {
    if (!isUserMenuOpen) return;
    const onClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-800/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-lg font-bold text-brand-600 dark:text-brand-100">
            <span className="inline-flex items-center gap-2">
              <img
                src={settings.logoUrl || "/default-pharmacy-logo.svg"}
                alt="Pharmacy logo"
                className="h-7 w-7 rounded object-cover"
              />
              {settings.pharmacyName || "Pharmacy Manager"}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white"
                onClick={() => setIsUserMenuOpen((value) => !value)}
              >
                {userInitials}
              </button>

              <div
                className={`absolute right-0 top-12 z-40 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg transition dark:border-slate-700 dark:bg-slate-800 ${
                  isUserMenuOpen ? "visible opacity-100" : "invisible opacity-0"
                }`}
              >
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email} | {user?.role}
                </p>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button onClick={handleLogout} className="button-muted" type="button">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[220px_1fr]">
        <aside className="card h-fit">
          <p className="mb-4 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Navigation
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
