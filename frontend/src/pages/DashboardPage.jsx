import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api/client";
import { money, shortDate } from "../utils/format";

const rangeOptions = [
  { key: "weekly", label: "Weekly", days: 7 },
  { key: "monthly", label: "Monthly", days: 30 },
  { key: "quarterly", label: "Quarterly", days: 90 },
  { key: "yearly", label: "Yearly", days: 365 }
];

const getStartDateByRange = (range) => {
  const option = rangeOptions.find((item) => item.key === range) || rangeOptions[1];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - option.days + 1);
  return start;
};

const DashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [sales, setSales] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [range, setRange] = useState("monthly");
  const [alerts, setAlerts] = useState({ lowStock: [], expiringSoon: [], expired: [], outOfStock: [] });

  useEffect(() => {
    const load = async () => {
      const [analyticsRes, alertsRes, salesRes, medicinesRes] = await Promise.all([
        api.get("/analytics/dashboard"),
        api.get("/medicines/alerts?days=90"),
        api.get("/sales"),
        api.get("/medicines")
      ]);

      setAnalytics(analyticsRes.data);
      setAlerts(alertsRes.data);
      setSales(salesRes.data);
      setMedicines(medicinesRes.data);
    };

    load();
  }, []);

  const periodAnalytics = useMemo(() => {
    const startDate = getStartDateByRange(range);
    const filteredSales = sales.filter((sale) => new Date(sale.soldAt) >= startDate);

    const bestSellingMap = {};
    const salesByCategoryMap = {};
    const medicineCategoryMap = medicines.reduce((acc, medicine) => {
      acc[String(medicine._id)] = medicine.category;
      return acc;
    }, {});

    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const medicineName = item.medicineName || "Unknown";
        const medicineId = String(item.medicine || "");
        const category = medicineCategoryMap[medicineId] || "Uncategorized";

        bestSellingMap[medicineName] = (bestSellingMap[medicineName] || 0) + Number(item.quantity || 0);
        salesByCategoryMap[category] = (salesByCategoryMap[category] || 0) + Number(item.lineTotal || 0);
      });
    });

    const bestSelling = Object.entries(bestSellingMap)
      .map(([name, quantitySold]) => ({ name, quantitySold }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 8);

    const salesByCategory = Object.entries(salesByCategoryMap)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    const fastMoving = [...bestSelling];

    return { bestSelling, salesByCategory, fastMoving };
  }, [range, sales, medicines]);

  if (!analytics) {
    return <div className="card">Loading dashboard...</div>;
  }

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card">
          <h3 className="text-base font-semibold">Low Stock</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {alerts.lowStock.length > 0 ? (
              alerts.lowStock.slice(0, 6).map((item) => (
                <li key={item._id}>{item.medicineName} ({item.quantityInStock})</li>
              ))
            ) : (
              <li className="text-slate-500 dark:text-slate-400">No low stock alerts.</li>
            )}
          </ul>
        </div>
        <div className="card">
          <h3 className="text-base font-semibold">Expiring Soon</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {alerts.expiringSoon.length > 0 ? (
              alerts.expiringSoon.slice(0, 6).map((item) => (
                <li key={item._id}>{item.medicineName} ({shortDate(item.expiryDate)})</li>
              ))
            ) : (
              <li className="text-slate-500 dark:text-slate-400">No expiring medicines right now.</li>
            )}
          </ul>
        </div>
        <div className="card">
          <h3 className="text-base font-semibold">Out Of Stock</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {alerts.outOfStock.length > 0 ? (
              alerts.outOfStock.slice(0, 6).map((item) => (
                <li key={item._id}>{item.medicineName}</li>
              ))
            ) : (
              <li className="text-slate-500 dark:text-slate-400">No out-of-stock medicines.</li>
            )}
          </ul>
        </div>
      </section>

      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Analytics Range</h2>
          <div className="flex flex-wrap gap-2">
            {rangeOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setRange(option.key)}
                className={`rounded-lg px-3 py-2 text-sm ${
                  range === option.key
                    ? "bg-brand-600 text-white"
                    : "border border-slate-300 dark:border-slate-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card h-80">
          <h2 className="mb-4 text-lg font-semibold">Best Selling Medicines</h2>
          {periodAnalytics.bestSelling.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={periodAnalytics.bestSelling}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantitySold" fill="#15803d" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No data in selected period.</p>
          )}
        </div>

        <div className="card h-80">
          <h2 className="mb-4 text-lg font-semibold">Sales By Category</h2>
          {periodAnalytics.salesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={periodAnalytics.salesByCategory} dataKey="total" nameKey="category" outerRadius={100} fill="#16a34a" />
                <Tooltip formatter={(value) => money(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No data in selected period.</p>
          )}
        </div>
      </section>

      <section className="grid gap-4">
        <div className="card h-80">
          <h2 className="mb-4 text-lg font-semibold">Fast Moving Medicines</h2>
          {periodAnalytics.fastMoving.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={periodAnalytics.fastMoving}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantitySold" fill="#0f766e" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No data in selected period.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
