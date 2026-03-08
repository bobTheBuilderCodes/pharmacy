import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import Modal from "../components/Modal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import Spinner from "../components/Spinner";
import { useToast } from "../context/ToastContext";

const initialForm = {
  supplierName: "",
  contactPerson: "",
  phoneNumber: "",
  email: "",
  address: ""
};

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const { showToast } = useToast();

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/suppliers");
      setSuppliers(data);
    } catch {
      showToast("Failed to load suppliers.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAddModal = () => {
    setEditingSupplierId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplierId(supplier._id);
    setForm({
      supplierName: supplier.supplierName || "",
      contactPerson: supplier.contactPerson || "",
      phoneNumber: supplier.phoneNumber || "",
      email: supplier.email || "",
      address: supplier.address || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      if (editingSupplierId) {
        await api.put(`/suppliers/${editingSupplierId}`, form);
        showToast("Supplier updated successfully.", "success");
      } else {
        await api.post("/suppliers", form);
        showToast("Supplier added successfully.", "success");
      }

      setForm(initialForm);
      setEditingSupplierId(null);
      setIsModalOpen(false);
      await load();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to save supplier.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const requestDelete = (supplier) => {
    setPendingDelete({ id: supplier._id, name: supplier.supplierName });
  };

  const confirmDelete = async () => {
    if (!pendingDelete?.id) return;
    try {
      setDeletingId(pendingDelete.id);
      await api.delete(`/suppliers/${pendingDelete.id}`);
      showToast("Supplier deleted.", "success");
      await load();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete supplier.", "error");
    } finally {
      setDeletingId("");
      setPendingDelete(null);
    }
  };

  const filteredSuppliers = useMemo(
    () =>
      suppliers.filter((supplier) => {
        const term = search.toLowerCase();
        return (
          supplier.supplierName?.toLowerCase().includes(term) ||
          supplier.contactPerson?.toLowerCase().includes(term) ||
          supplier.phoneNumber?.toLowerCase().includes(term)
        );
      }),
    [suppliers, search]
  );

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Suppliers</h2>
        <button className="button" type="button" onClick={openAddModal}>
          Add Supplier
        </button>
      </div>

      <input
        className="input mb-3 max-w-sm"
        placeholder="Search supplier"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto">
        <table className="table-enhanced">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="p-2">Name</th>
              <th className="p-2">Contact</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Email</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-6" colSpan={5}>
                  <div className="flex items-center justify-center gap-2">
                    <Spinner />
                    <span className="text-sm text-slate-500 dark:text-slate-400">Loading suppliers...</span>
                  </div>
                </td>
              </tr>
            ) : filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((s) => (
                <tr key={s._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-2">{s.supplierName}</td>
                  <td className="p-2">{s.contactPerson || "-"}</td>
                  <td className="p-2">{s.phoneNumber || "-"}</td>
                  <td className="p-2">{s.email || "-"}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button className="button-muted" onClick={() => openEditModal(s)} type="button" disabled={submitting || !!deletingId}>
                        Edit
                      </button>
                      <button className="button-muted" onClick={() => requestDelete(s)} type="button" disabled={submitting || !!deletingId}>
                        {deletingId === s._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-6 text-center text-slate-500 dark:text-slate-400" colSpan={5}>
                  {search ? "No suppliers match your search." : "No suppliers yet. Click Add Supplier to create one."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title={editingSupplierId ? "Edit Supplier" : "Add Supplier"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="grid gap-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Supplier Name</label>
            <input className="input" value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Contact Person</label>
            <input className="input" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone Number</label>
            <input className="input" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Address</label>
            <textarea className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <button className="button" disabled={submitting}>
            {submitting ? "Saving..." : editingSupplierId ? "Update Supplier" : "Save Supplier"}
          </button>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={Boolean(pendingDelete)}
        title="Delete Supplier"
        message={`Are you sure you want to delete ${pendingDelete?.name || "this supplier"}?`}
        loading={Boolean(deletingId)}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};

export default SuppliersPage;
