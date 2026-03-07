import { useEffect, useState } from "react";
import { api } from "../api/client";
import { shortDate } from "../utils/format";

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
  const [form, setForm] = useState(initialForm);

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
    await load();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <form onSubmit={handleSubmit} className="card lg:col-span-1">
        <h2 className="mb-3 text-lg font-semibold">Record Purchase</h2>
        <div className="grid gap-2">
          <select className="input" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} required>
            <option value="">Supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.supplierName}
              </option>
            ))}
          </select>

          <select className="input" value={form.medicine} onChange={(e) => setForm({ ...form, medicine: e.target.value })} required>
            <option value="">Medicine</option>
            {medicines.map((m) => (
              <option key={m._id} value={m._id}>
                {m.medicineName}
              </option>
            ))}
          </select>

          <input className="input" type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
          <input className="input" type="number" placeholder="Purchase Price" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} required />
          <input className="input" placeholder="Batch Number" value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} />
          <input className="input" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} required />
          <input className="input" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
          <button className="button">Save Purchase</button>
        </div>
      </form>

      <div className="card lg:col-span-2">
        <h2 className="mb-3 text-lg font-semibold">Purchase History</h2>
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
              {purchases.map((p) => (
                <tr key={p._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-2">{p.purchaseId}</td>
                  <td className="p-2">{p.medicine?.medicineName || "-"}</td>
                  <td className="p-2">{p.supplier?.supplierName || "-"}</td>
                  <td className="p-2">{p.quantity}</td>
                  <td className="p-2">{p.purchasePrice}</td>
                  <td className="p-2">{shortDate(p.purchaseDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchasesPage;
