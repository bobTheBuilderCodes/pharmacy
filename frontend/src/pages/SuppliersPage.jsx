import { useEffect, useState } from "react";
import { api } from "../api/client";

const initialForm = {
  supplierName: "",
  contactPerson: "",
  phoneNumber: "",
  email: "",
  address: ""
};

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    const { data } = await api.get("/suppliers");
    setSuppliers(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/suppliers", form);
    setForm(initialForm);
    await load();
  };

  const remove = async (id) => {
    await api.delete(`/suppliers/${id}`);
    await load();
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <form onSubmit={handleSubmit} className="card md:col-span-1">
        <h2 className="mb-3 text-lg font-semibold">Add Supplier</h2>
        <div className="grid gap-2">
          <input className="input" placeholder="Supplier Name" value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })} required />
          <input className="input" placeholder="Contact Person" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
          <input className="input" placeholder="Phone Number" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
          <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <textarea className="input" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <button className="button">Save Supplier</button>
        </div>
      </form>

      <div className="card md:col-span-2">
        <h2 className="mb-3 text-lg font-semibold">Suppliers</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
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
              {suppliers.map((s) => (
                <tr key={s._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-2">{s.supplierName}</td>
                  <td className="p-2">{s.contactPerson || "-"}</td>
                  <td className="p-2">{s.phoneNumber || "-"}</td>
                  <td className="p-2">{s.email || "-"}</td>
                  <td className="p-2">
                    <button className="button-muted" onClick={() => remove(s._id)}>
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

export default SuppliersPage;
