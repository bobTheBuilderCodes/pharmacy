import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import Modal from "../components/Modal";
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

const toDateInput = (value) => (value ? new Date(value).toISOString().split("T")[0] : "");

const MedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicineId, setEditingMedicineId] = useState(null);

  const load = async () => {
    const [medRes, supRes] = await Promise.all([api.get("/medicines"), api.get("/suppliers")]);
    setMedicines(medRes.data);
    setSuppliers(supRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const openAddModal = () => {
    setEditingMedicineId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (medicine) => {
    setEditingMedicineId(medicine._id);
    setForm({
      medicineName: medicine.medicineName || "",
      brandName: medicine.brandName || "",
      genericName: medicine.genericName || "",
      category: medicine.category || "",
      batchNumber: medicine.batchNumber || "",
      expiryDate: toDateInput(medicine.expiryDate),
      purchasePrice: medicine.purchasePrice ?? "",
      sellingPrice: medicine.sellingPrice ?? "",
      quantityInStock: medicine.quantityInStock ?? "",
      minimumStockLevel: medicine.minimumStockLevel ?? "",
      supplier: medicine.supplier?._id || "",
      barcodeSku: medicine.barcodeSku || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      supplier: form.supplier || undefined,
      purchasePrice: Number(form.purchasePrice),
      sellingPrice: Number(form.sellingPrice),
      quantityInStock: Number(form.quantityInStock),
      minimumStockLevel: Number(form.minimumStockLevel)
    };

    if (editingMedicineId) {
      await api.put(`/medicines/${editingMedicineId}`, payload);
    } else {
      await api.post("/medicines", payload);
    }

    setForm(initialForm);
    setEditingMedicineId(null);
    setIsModalOpen(false);
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
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Medicine</h2>
          <button className="button" type="button" onClick={openAddModal}>
            Add Medicine
          </button>
        </div>
        <input className="input mb-3 max-w-sm" placeholder="Search medicine" value={search} onChange={(e) => setSearch(e.target.value)} />

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
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item._id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="p-2">{item.medicineName}</td>
                    <td className="p-2">{item.category}</td>
                    <td className="p-2">{item.quantityInStock}</td>
                    <td className="p-2">{item.minimumStockLevel}</td>
                    <td className="p-2">{shortDate(item.expiryDate)}</td>
                    <td className="p-2">{item.supplier?.supplierName || "-"}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button className="button-muted" onClick={() => openEditModal(item)} type="button">
                          Edit
                        </button>
                        <button className="button-muted" onClick={() => handleDelete(item._id)} type="button">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-6 text-center text-slate-500 dark:text-slate-400" colSpan={7}>
                    {search ? "No medicines match your search." : "No medicines yet. Click Add Medicine to create one."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        title={editingMedicineId ? "Edit Medicine" : "Add Medicine"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="grid gap-2 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Medicine Name</label>
            <input className="input" value={form.medicineName} onChange={(e) => setForm({ ...form, medicineName: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Brand Name</label>
            <input className="input" value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Generic Name</label>
            <input className="input" value={form.genericName} onChange={(e) => setForm({ ...form, genericName: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Batch Number</label>
            <input className="input" value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Expiry Date</label>
            <input className="input" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Purchase Price</label>
            <input className="input" type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Selling Price</label>
            <input className="input" type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Quantity In Stock</label>
            <input className="input" type="number" value={form.quantityInStock} onChange={(e) => setForm({ ...form, quantityInStock: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Minimum Stock Level</label>
            <input className="input" type="number" value={form.minimumStockLevel} onChange={(e) => setForm({ ...form, minimumStockLevel: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Supplier</label>
            <select className="input" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.supplierName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Barcode / SKU</label>
            <input className="input" value={form.barcodeSku} onChange={(e) => setForm({ ...form, barcodeSku: e.target.value })} />
          </div>
          <button className="button md:col-span-2" type="submit">
            {editingMedicineId ? "Update Medicine" : "Save Medicine"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default MedicinesPage;
