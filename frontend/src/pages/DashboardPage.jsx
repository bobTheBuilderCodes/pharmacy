import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api/client";
import StatCard from "../components/StatCard";
import { money, shortDate } from "../utils/format";

const DashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [movement, setMovement] = useState({ fastMoving: [], slowMoving: [] });
  const [alerts, setAlerts] = useState({ lowStock: [], expiringSoon: [], expired: [], outOfStock: [] });

  useEffect(() => {
    const load = async () => {
      const [analyticsRes, categoryRes, movementRes, alertsRes] = await Promise.all([
        api.get("/analytics/dashboard"),
        api.get("/analytics/sales-categories"),
        api.get("/analytics/movement"),
        api.get("/medicines/alerts?days=90")
      ]);
      setAnalytics(analyticsRes.data);
      setCategories(categoryRes.data);
      setMovement(movementRes.data);
      setAlerts(alertsRes.data);
    };

    load();
  }, []);

  if (!analytics) {
    return <div className="card">Loading dashboard...</div>;
  }

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Daily Sales" value={money(analytics.salesAnalytics.dailySales)} />
        <StatCard title="Weekly Sales" value={money(analytics.salesAnalytics.weeklySales)} />
        <StatCard title="Monthly Revenue" value={money(analytics.salesAnalytics.monthlyRevenue)} />
        <StatCard title="Estimated Profit" value={money(analytics.financialInsights.estimatedProfit)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card h-80">
          <h2 className="mb-4 text-lg font-semibold">Best Selling Medicines</h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={analytics.salesAnalytics.bestSellingMedicines}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantitySold" fill="#15803d" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card h-80">
          <h2 className="mb-4 text-lg font-semibold">Sales By Category</h2>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={categories} dataKey="total" nameKey="category" outerRadius={100} fill="#16a34a" />
              <Tooltip formatter={(value) => money(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card h-80">
          <h2 className="mb-4 text-lg font-semibold">Sales By Staff</h2>
          {analytics.salesAnalytics.salesByStaff?.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={analytics.salesAnalytics.salesByStaff}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="staffName" />
                <YAxis />
                <Tooltip formatter={(value) => money(value)} />
                <Bar dataKey="totalSales" fill="#15803d" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No staff sales data yet.</p>
          )}
        </div>

        <div className="card h-80">
          <h2 className="mb-4 text-lg font-semibold">Fast Moving Medicines (30 days)</h2>
          {movement.fastMoving?.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={movement.fastMoving.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="medicineName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="soldQty" fill="#0f766e" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No movement data yet.</p>
          )}
        </div>
      </section>

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
    </div>
  );
};

export default DashboardPage;
