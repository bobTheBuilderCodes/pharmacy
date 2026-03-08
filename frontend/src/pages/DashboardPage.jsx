import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { api } from "../api/client";
import LoadingState from "../components/LoadingState";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { money } from "../utils/format";

const analyticsTabs = [
  { key: "best_selling", label: "Best Selling Medicines" },
  { key: "sales_vs_purchases", label: "Sales vs Purchases" }
];

const periodTabs = [
  { key: "monthly", label: "Monthly" },
  { key: "quarterly", label: "Quarterly" }
];

const monthKeys = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const quarterKeys = ["Q1", "Q2", "Q3", "Q4"];
const lineColors = ["#15803d", "#0f766e", "#2563eb", "#9333ea", "#c2410c", "#be123c", "#0891b2", "#4f46e5"];

const DashboardPage = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [alerts, setAlerts] = useState({ lowStock: [], expiringSoon: [], expired: [], outOfStock: [] });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState("best_selling");
  const [periodMode, setPeriodMode] = useState("monthly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [salesRes, purchasesRes, alertsRes] = await Promise.all([
          api.get("/sales"),
          api.get("/purchases"),
          api.get("/medicines/alerts?days=90")
        ]);
        setSales(salesRes.data);
        setPurchases(purchasesRes.data);
        setAlerts(alertsRes.data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const yearOptions = useMemo(() => {
    const years = new Set([new Date().getFullYear()]);
    sales.forEach((sale) => years.add(new Date(sale.soldAt).getFullYear()));
    purchases.forEach((purchase) => years.add(new Date(purchase.purchaseDate).getFullYear()));
    return [...years].sort((a, b) => b - a);
  }, [sales, purchases]);

  const salesInYear = useMemo(
    () => sales.filter((sale) => new Date(sale.soldAt).getFullYear() === selectedYear),
    [sales, selectedYear]
  );

  const purchasesInYear = useMemo(
    () => purchases.filter((purchase) => new Date(purchase.purchaseDate).getFullYear() === selectedYear),
    [purchases, selectedYear]
  );

  const summary = useMemo(() => {
    const totalSales = salesInYear.reduce((acc, sale) => acc + Number(sale.totalAmount || 0), 0);
    const totalPurchases = purchasesInYear.reduce(
      (acc, purchase) => acc + Number(purchase.purchasePrice || 0) * Number(purchase.quantity || 0),
      0
    );

    return {
      totalSales,
      totalPurchases,
      estimatedProfit: totalSales - totalPurchases
    };
  }, [salesInYear, purchasesInYear]);

  const periodLabels = useMemo(() => (periodMode === "monthly" ? monthKeys : quarterKeys), [periodMode]);

  const bestSellingSeries = useMemo(() => {
    const medicineTotalMap = {};
    const medicinePeriodMap = {};

    salesInYear.forEach((sale) => {
      const soldAt = new Date(sale.soldAt);
      const periodLabel = periodMode === "monthly" ? monthKeys[soldAt.getMonth()] : `Q${Math.floor(soldAt.getMonth() / 3) + 1}`;

      sale.items.forEach((item) => {
        const name = item.medicineName || "Unknown";
        const qty = Number(item.quantity || 0);

        medicineTotalMap[name] = (medicineTotalMap[name] || 0) + qty;

        if (!medicinePeriodMap[name]) {
          medicinePeriodMap[name] = {};
        }
        medicinePeriodMap[name][periodLabel] = (medicinePeriodMap[name][periodLabel] || 0) + qty;
      });
    });

    const topMedicines = Object.entries(medicineTotalMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => name);

    const rows = periodLabels.map((label) => {
      const row = { period: label };
      topMedicines.forEach((medicineName) => {
        row[medicineName] = medicinePeriodMap[medicineName]?.[label] || 0;
      });
      return row;
    });

    return { rows, topMedicines };
  }, [salesInYear, periodMode, periodLabels]);

  const salesVsPurchasesSeries = useMemo(() => {
    const rows = periodLabels.map((label) => ({ period: label, sales: 0, purchases: 0, profit: 0 }));

    const rowForMonth = (monthIndex) => {
      if (periodMode === "monthly") return rows[monthIndex];
      return rows[Math.floor(monthIndex / 3)];
    };

    salesInYear.forEach((sale) => {
      const date = new Date(sale.soldAt);
      rowForMonth(date.getMonth()).sales += Number(sale.totalAmount || 0);
    });

    purchasesInYear.forEach((purchase) => {
      const date = new Date(purchase.purchaseDate);
      rowForMonth(date.getMonth()).purchases += Number(purchase.purchasePrice || 0) * Number(purchase.quantity || 0);
    });

    return rows.map((row) => ({
      ...row,
      profit: row.sales - row.purchases
    }));
  }, [periodMode, periodLabels, salesInYear, purchasesInYear]);

  if (loading) {
    return <LoadingState label="Loading dashboard analytics..." />;
  }

  return (
    <div className="grid gap-4">
      <section className="relative overflow-hidden rounded-2xl">
        <img
          src="https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=1800&q=80"
          alt="Pharmacy dashboard banner"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-800/80 to-slate-900/85" />
        <div className="relative grid gap-4 p-6 text-white lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-wide text-emerald-100/90">Dashboard Overview</p>
            <h1 className="mt-1 text-3xl font-extrabold leading-tight">
              Welcome back, {user?.name || "Pharmacy Admin"}.
            </h1>
            <p className="mt-2 text-sm text-emerald-50/90">
              Track your business performance for {selectedYear} at a glance.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-emerald-100">Sales</p>
              <p className="mt-1 text-lg font-bold">{money(summary.totalSales)}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-emerald-100">Purchases</p>
              <p className="mt-1 text-lg font-bold">{money(summary.totalPurchases)}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-emerald-100">Profit</p>
              <p className="mt-1 text-lg font-bold">{money(summary.estimatedProfit)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="Low Stock" value={alerts.lowStock.length} hint="Medicines below minimum stock" />
        <StatCard title="Expiring Soon" value={alerts.expiringSoon.length} hint="Medicines nearing expiry" />
        <StatCard title="Out Of Stock" value={alerts.outOfStock.length} hint="Medicines with zero stock" />
      </section>

     
      <section className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Analytics tabs">
            {analyticsTabs.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg px-3 py-2 text-sm ${
                  activeTab === tab.key
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 whitespace-nowrap">
            {periodTabs.map((period) => (
              <button
                key={period.key}
                role="tab"
                aria-selected={periodMode === period.key}
                type="button"
                onClick={() => setPeriodMode(period.key)}
                className={`rounded-lg px-3 py-2 text-sm ${
                  periodMode === period.key
                    ? "bg-brand-600 text-white"
                    : "border border-slate-300 dark:border-slate-600"
                }`}
              >
                {period.label}
              </button>
            ))}

            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              aria-label="Select analytics year"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-96">
          {activeTab === "best_selling" ? (
            bestSellingSeries.topMedicines.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bestSellingSeries.rows}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {bestSellingSeries.topMedicines.map((medicineName, index) => (
                    <Line
                      key={medicineName}
                      type="monotone"
                      dataKey={medicineName}
                      stroke={lineColors[index % lineColors.length]}
                      strokeWidth={3}
                      dot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No best-selling data for selected year.</p>
            )
          ) : salesVsPurchasesSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesVsPurchasesSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => money(value)} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#15803d" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="purchases" stroke="#b45309" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="profit" stroke="#0f172a" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No sales/purchase data for selected period.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
