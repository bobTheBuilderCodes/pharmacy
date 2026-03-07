import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import Modal from "../components/Modal";
import { money, shortDate } from "../utils/format";

const initialForm = {
  supplier: "",
  medicine: "",
  quantity: "",
  purchasePrice: "",
  batchNumber: "",
  expiryDate: "",
  purchaseDate: ""
};

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const load = async () => {
    const [purchaseRes, supplierRes, medicineRes] = await Promise.all([
      api.get("/purchases"),
      api.get("/suppliers"),
      api.get("/medicines")
    ]);

    setPurchases(purchaseRes.data);
    setSuppliers(supplierRes.data);
    setMedicines(medicineRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/purchases", {
      ...form,
      quantity: Number(form.quantity),
      purchasePrice: Number(form.purchasePrice)
    });
    setForm(initialForm);
    setIsAddOpen(false);
    await load();
  };

  const filteredPurchases = useMemo(
    () =>
      purchases.filter((purchase) => {
        const term = search.toLowerCase();
        return (
          purchase.purchaseId?.toLowerCase().includes(term) ||
          purchase.medicine?.medicineName?.toLowerCase().includes(term) ||
          purchase.supplier?.supplierName?.toLowerCase().includes(term)
        );
      }),
    [purchases, search]
  );

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Purchase History</h2>
        <button className="button" type="button" onClick={() => setIsAddOpen(true)}>
          Add Purchase
        </button>
      </div>

      <input
        className="input mb-3 max-w-sm"
        placeholder="Search purchase"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="p-2">Purchase ID</th>
              <th className="p-2">Medicine</th>
              <th className="p-2">Supplier</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Price</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length > 0 ? (
              filteredPurchases.map((p) => (
                <tr key={p._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-2">{p.purchaseId}</td>
                  <td className="p-2">{p.medicine?.medicineName || "-"}</td>
                  <td className="p-2">{p.supplier?.supplierName || "-"}</td>
                  <td className="p-2">{p.quantity}</td>
                  <td className="p-2">{money(p.purchasePrice)}</td>
                  <td className="p-2">{shortDate(p.purchaseDate)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-6 text-center text-slate-500 dark:text-slate-400" colSpan={6}>
                  {search ? "No purchases match your search." : "No purchases recorded yet. Click Add Purchase to create one."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal title="Record Purchase" isOpen={isAddOpen} onClose={() => setIsAddOpen(false)}>
        <form onSubmit={handleSubmit} className="grid gap-2 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Supplier</label>
            <select className="input" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} required>
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.supplierName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Medicine</label>
            <select className="input" value={form.medicine} onChange={(e) => setForm({ ...form, medicine: e.target.value })} required>
              <option value="">Select Medicine</option>
              {medicines.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.medicineName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Quantity</label>
            <input className="input" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Purchase Price</label>
            <input className="input" type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Batch Number</label>
            <input className="input" value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Expiry Date</label>
            <input className="input" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Purchase Date</label>
            <input className="input" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
          </div>
          <button className="button md:col-span-2">Save Purchase</button>
        </form>
      </Modal>
    </div>
  );
};

export default PurchasesPage;
