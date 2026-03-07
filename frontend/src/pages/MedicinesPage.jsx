import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { shortDate } from "../utils/format";

const initialForm = {
  medicineName: "",
  brandName: "",
  genericName: "",
  category: "",
  batchNumber: "",
  expiryDate: "",
  purchasePrice: "",
  sellingPrice: "",
  quantityInStock: "",
  minimumStockLevel: "",
  supplier: "",
  barcodeSku: ""
};

const MedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    const [medRes, supRes] = await Promise.all([api.get("/medicines"), api.get("/suppliers")]);
    setMedicines(medRes.data);
    setSuppliers(supRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post("/medicines", {
      ...form,
      purchasePrice: Number(form.purchasePrice),
      sellingPrice: Number(form.sellingPrice),
      quantityInStock: Number(form.quantityInStock),
      minimumStockLevel: Number(form.minimumStockLevel)
    });
    setForm(initialForm);
    await load();
  };

  const handleDelete = async (id) => {
    await api.delete(`/medicines/${id}`);
    await load();
  };

  const filtered = useMemo(
    () => medicines.filter((m) => m.medicineName.toLowerCase().includes(search.toLowerCase())),
    [medicines, search]
  );

  return (
    <div className="grid gap-4">
      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Add Medicine</h2>
        <form onSubmit={handleCreate} className="grid gap-2 md:grid-cols-3">
          <input className="input" placeholder="Medicine Name" value={form.medicineName} onChange={(e) => setForm({ ...form, medicineName: e.target.value })} required />
          <input className="input" placeholder="Brand Name" value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} />
          <input className="input" placeholder="Generic Name" value={form.genericName} onChange={(e) => setForm({ ...form, genericName: e.target.value })} />
          <input className="input" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <input className="input" placeholder="Batch Number" value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} />
          <input className="input" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} required />
          <input className="input" placeholder="Purchase Price" type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} required />
          <input className="input" placeholder="Selling Price" type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} required />
          <input className="input" placeholder="Qty In Stock" type="number" value={form.quantityInStock} onChange={(e) => setForm({ ...form, quantityInStock: e.target.value })} required />
          <input className="input" placeholder="Min Stock Level" type="number" value={form.minimumStockLevel} onChange={(e) => setForm({ ...form, minimumStockLevel: e.target.value })} required />
          <select className="input" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.supplierName}
              </option>
            ))}
          </select>
          <input className="input" placeholder="Barcode / SKU" value={form.barcodeSku} onChange={(e) => setForm({ ...form, barcodeSku: e.target.value })} />
          <button className="button md:col-span-3" type="submit">
            Save Medicine
          </button>
        </form>
      </div>

      <div className="card">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Inventory</h2>
          <input className="input max-w-xs" placeholder="Search medicine" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="p-2">Medicine</th>
                <th className="p-2">Category</th>
                <th className="p-2">Stock</th>
                <th className="p-2">Min</th>
                <th className="p-2">Expiry</th>
                <th className="p-2">Supplier</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-2">{item.medicineName}</td>
                  <td className="p-2">{item.category}</td>
                  <td className="p-2">{item.quantityInStock}</td>
                  <td className="p-2">{item.minimumStockLevel}</td>
                  <td className="p-2">{shortDate(item.expiryDate)}</td>
                  <td className="p-2">{item.supplier?.supplierName || "-"}</td>
                  <td className="p-2">
                    <button className="button-muted" onClick={() => handleDelete(item._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedicinesPage;
