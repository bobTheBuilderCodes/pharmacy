import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoadingState from "../components/LoadingState";
import { useSettings } from "../context/SettingsContext";
import { useToast } from "../context/ToastContext";

const defaultLogoPath = "/default-pharmacy-logo.svg";

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const SettingsPage = () => {
  const { user } = useAuth();
  const { settings, loadingSettings, saveSettings } = useSettings();
  const [form, setForm] = useState({
    pharmacyName: "",
    contactEmail: "",
    contactPhone: "",
    location: "",
    address: "",
    website: "",
    logoUrl: ""
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    setForm({
      pharmacyName: settings.pharmacyName || "",
      contactEmail: settings.contactEmail || "",
      contactPhone: settings.contactPhone || "",
      location: settings.location || "",
      address: settings.address || "",
      website: settings.website || "",
      logoUrl: settings.logoUrl || ""
    });
  }, [settings]);

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please upload an image file.");
      showToast("Please upload an image file.", "error");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setMessage("Logo should be 3MB or less.");
      showToast("Logo should be 3MB or less.", "error");
      return;
    }

    const base64 = await toBase64(file);
    setForm((prev) => ({ ...prev, logoUrl: base64 }));
    setMessage("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (user?.role !== "admin") return;

    setSaving(true);
    setMessage("");
    try {
      await saveSettings(form);
      setMessage("Settings saved successfully.");
      showToast("Settings saved successfully.", "success");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save settings.");
      showToast(error.response?.data?.message || "Failed to save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const resetLogo = () => {
    setForm((prev) => ({ ...prev, logoUrl: "" }));
  };

  if (loadingSettings) {
    return <LoadingState label="Loading settings..." />;
  }

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Pharmacy Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage pharmacy details and branding.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2 flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <img
            src={form.logoUrl || defaultLogoPath}
            alt="Pharmacy logo"
            className="h-20 w-20 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
          />
          <div className="grid gap-2">
            <label className="button-muted w-fit cursor-pointer" htmlFor="logoUpload">
              Upload Logo
            </label>
            <input id="logoUpload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            <button className="button-muted w-fit" type="button" onClick={resetLogo}>
              Use Default Logo
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Pharmacy Name</label>
          <input className="input" value={form.pharmacyName} onChange={(e) => setForm({ ...form, pharmacyName: e.target.value })} required />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Contact Email</label>
          <input className="input" type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Contact Phone</label>
          <input className="input" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Location</label>
          <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Address</label>
          <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Website</label>
          <input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        </div>

        {message ? <p className="md:col-span-2 text-sm text-slate-600 dark:text-slate-300">{message}</p> : null}

        <div className="md:col-span-2">
          <button className="button" type="submit" disabled={saving || user?.role !== "admin"}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {user?.role !== "admin" ? (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Only admins can update settings.</p>
          ) : null}
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
