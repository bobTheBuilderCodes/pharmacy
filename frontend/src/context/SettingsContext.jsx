import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const SettingsContext = createContext(null);

const defaultSettings = {
  pharmacyName: "My Pharmacy",
  contactEmail: "",
  contactPhone: "",
  location: "",
  address: "",
  website: "",
  logoUrl: ""
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const loadSettings = async () => {
    try {
      const { data } = await api.get("/settings");
      setSettings({ ...defaultSettings, ...data });
    } catch {
      setSettings(defaultSettings);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveSettings = async (payload) => {
    const { data } = await api.put("/settings", payload);
    setSettings({ ...defaultSettings, ...data });
    return data;
  };

  const value = useMemo(
    () => ({ settings, loadingSettings, loadSettings, saveSettings }),
    [settings, loadingSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
};
