import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import StatCard from "../components/StatCard";
import { useToast } from "../context/ToastContext";
import { money, shortDate } from "../utils/format";

const paymentLabel = {
  cash: "Cash",
  mobile_money: "Mobile Money",
  card: "Card"
};

const SalesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [sales, setSales] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [medicineQuery, setMedicineQuery] = useState("");
  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [saleError, setSaleError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    try {
      setLoading(true);
      const [medRes, salesRes] = await Promise.all([api.get("/medicines"), api.get("/sales")]);
      setMedicines(medRes.data);
      setSales(salesRes.data);
    } catch {
      showToast("Failed to load sales.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedMedicine = useMemo(
    () => medicines.find((medicine) => medicine._id === selectedMedicineId),
    [medicines, selectedMedicineId]
  );

  const filteredSales = useMemo(
    () => sales.filter((sale) => (paymentFilter === "all" ? true : sale.paymentMethod === paymentFilter)),
    [sales, paymentFilter]
  );

  const salesSummary = useMemo(() => {
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - 6);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const sumFrom = (startDate) =>
      filteredSales
        .filter((sale) => new Date(sale.soldAt) >= startDate)
        .reduce((total, sale) => total + Number(sale.totalAmount || 0), 0);

    return {
      today: sumFrom(startOfDay),
      week: sumFrom(startOfWeek),
      month: sumFrom(startOfMonth),
      year: sumFrom(startOfYear)
    };
  }, [filteredSales]);

  const handleMedicineSearch = (value) => {
    setMedicineQuery(value);
    const match = medicines.find((medicine) => medicine.medicineName.toLowerCase() === value.trim().toLowerCase());
    setSelectedMedicineId(match?._id || "");
  };

  const openSaleModal = () => {
    setDiscount(0);
    setPaymentMethod("cash");
    setMedicineQuery("");
    setSelectedMedicineId("");
    setQuantity(1);
    setSaleError("");
    setIsAddOpen(true);
  };

  const grossTotal = selectedMedicine ? selectedMedicine.sellingPrice * Number(quantity || 0) : 0;
  const total = Math.max(grossTotal - Number(discount || 0), 0);

  const createSale = async () => {
    setSaleError("");

    if (!selectedMedicine) {
      setSaleError("Select a medicine from the dropdown list.");
      return;
    }

    const qty = Number(quantity || 0);
    if (!qty || qty < 1) {
      setSaleError("Quantity must be at least 1.");
      return;
    }

    if (qty > selectedMedicine.quantityInStock) {
      setSaleError("Requested quantity exceeds available stock.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/sales", {
        items: [{ medicineId: selectedMedicine._id, quantity: qty }],
        discount: Number(discount || 0),
        paymentMethod
      });

      showToast("Sale completed successfully.", "success");
      setDiscount(0);
      setPaymentMethod("cash");
      setMedicineQuery("");
      setSelectedMedicineId("");
      setQuantity(1);
      setSaleError("");
      setIsAddOpen(false);
      await load();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to complete sale.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Sales Today" value={money(salesSummary.today)} />
        <StatCard title="Sales This Week" value={money(salesSummary.week)} />
        <StatCard title="Sales This Month" value={money(salesSummary.month)} />
        <StatCard title="Sales This Year" value={money(salesSummary.year)} />
      </section>

      <div className="card mt-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Recent Sales</h2>
          <button className="button" type="button" onClick={openSaleModal} disabled={submitting}>
            Add Sale
          </button>
        </div>
        <div className="mb-3 max-w-xs">
          <label className="mb-1 block text-sm font-medium">Payment Filter</label>
          <select className="input" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
            <option value="all">All Payments</option>
            <option value="cash">Cash</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="card">Card</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="table-enhanced">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="p-2">Sale ID</th>
                <th className="p-2">Date</th>
                <th className="p-2">Items</th>
                <th className="p-2">Payment</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Salesperson</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-6" colSpan={6}>
                    <div className="flex items-center justify-center gap-2">
                      <Spinner />
                      <span className="text-sm text-slate-500 dark:text-slate-400">Loading sales...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <tr key={sale._id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="p-2">{sale.saleId}</td>
                    <td className="p-2">{shortDate(sale.soldAt)}</td>
                    <td className="p-2">{sale.items.length}</td>
                    <td className="p-2">{paymentLabel[sale.paymentMethod] || sale.paymentMethod}</td>
                    <td className="p-2">{money(sale.totalAmount)}</td>
                    <td className="p-2">{sale.salesperson?.name || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-6 text-center text-slate-500 dark:text-slate-400" colSpan={6}>
                    {paymentFilter === "all"
                      ? "No sales recorded yet. Click Add Sale to create one."
                      : "No sales found for the selected payment type."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal title="Add Sale" isOpen={isAddOpen} onClose={() => setIsAddOpen(false)}>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Medicine</label>
            <input
              className="input"
              list="medicine-options"
              value={medicineQuery}
              onChange={(e) => handleMedicineSearch(e.target.value)}
              placeholder="Search and select medicine"
            />
            <datalist id="medicine-options">
              {medicines.map((medicine) => (
                <option
                  key={medicine._id}
                  value={medicine.medicineName}
                  label={`${medicine.category} | ${money(medicine.sellingPrice)} | Stock ${medicine.quantityInStock}`}
                />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Selling Price</label>
            <input className="input" readOnly value={selectedMedicine ? money(selectedMedicine.sellingPrice) : "-"} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Quantity</label>
            <input className="input" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Discount</label>
            <input className="input" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Payment Method</label>
            <select className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="card">Card</option>
            </select>
          </div>

          <div className="md:col-span-2 grid gap-1 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
            <p>Gross Total: {money(grossTotal)}</p>
            <p>Net Total: {money(total)}</p>
          </div>

          {saleError ? <p className="md:col-span-2 text-sm text-red-600">{saleError}</p> : null}

          <button className="button md:col-span-2" onClick={createSale} type="button" disabled={submitting}>
            {submitting ? "Processing..." : "Complete Sale"}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default SalesPage;
