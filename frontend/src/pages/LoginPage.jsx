import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

const LoginPage = () => {
  const [email, setEmail] = useState("admin@pharmacy.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1800&q=80"
        alt="Pharmacy background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/75 via-emerald-900/60 to-slate-900/75" />

      <div className="relative grid min-h-screen place-items-center p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-white/20 bg-white/90 p-6 shadow-2xl backdrop-blur dark:bg-slate-900/90">
          <div className="mb-1 flex flex-col items-center justify-center text-center">
            <img
              src={settings.logoUrl || "/default-pharmacy-logo.svg"}
              alt="Pharmacy logo"
              className="mb-2 h-12 w-12 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
            />
            <h1 className="text-2xl font-bold">{settings.pharmacyName || "Pharmacy Login"}</h1>
          </div>
          <p className="text-sm text-slate-500 text-center dark:text-slate-400">Sign in with your account.</p>

          <div className="mt-4 grid gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button className="button inline-flex items-center justify-center gap-2" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
