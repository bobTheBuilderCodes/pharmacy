import { api } from "../api/client";

const downloadFile = async (url, filename) => {
  const response = await api.get(url, { responseType: "blob" });
  const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = fileUrl;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const ReportsPage = () => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <div className="card">
      <h2 className="text-lg font-semibold">Sales Report</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Download CSV export of all sales transactions.</p>
      <button className="button mt-4" onClick={() => downloadFile("/reports/sales.csv", "sales-report.csv")}>
        Export CSV
      </button>
    </div>

    <div className="card">
      <h2 className="text-lg font-semibold">Inventory Report</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Download CSV export for medicine stock and expiry.</p>
      <button className="button mt-4" onClick={() => downloadFile("/reports/inventory.csv", "inventory-report.csv")}>
        Export CSV
      </button>
    </div>

    <div className="card">
      <h2 className="text-lg font-semibold">Expiry Report</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Download CSV for expired and expiring medicines.</p>
      <button className="button mt-4" onClick={() => downloadFile("/reports/expiry.csv", "expiry-report.csv")}>
        Export CSV
      </button>
    </div>

    <div className="card">
      <h2 className="text-lg font-semibold">Profit Report</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Download PDF with revenue/cost/profit summary.</p>
      <button className="button mt-4" onClick={() => downloadFile("/reports/profit.pdf", "profit-report.pdf")}>
        Export PDF
      </button>
    </div>
  </div>
);

export default ReportsPage;
