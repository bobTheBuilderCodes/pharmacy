import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { money, shortDate } from "../utils/format";

const SalesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const load = async () => {
    const [medRes, salesRes] = await Promise.all([api.get("/medicines"), api.get("/sales")]);
    setMedicines(medRes.data);
    setSales(salesRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const filteredMeds = useMemo(
    () => medicines.filter((m) => m.medicineName.toLowerCase().includes(search.toLowerCase())),
    [medicines, search]
  );

  const addToCart = (med) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.medicineId === med._id);
      if (existing) {
        return prev.map((item) =>
          item.medicineId === med._id ? { ...item, quantity: Math.min(item.quantity + 1, med.quantityInStock) } : item
        );
      }
      return [...prev, { medicineId: med._id, name: med.medicineName, quantity: 1, unitPrice: med.sellingPrice }];
    });
  };

  const changeQty = (medicineId, quantity) => {
    setCart((prev) => prev.map((item) => (item.medicineId === medicineId ? { ...item, quantity: Number(quantity) } : item)));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const total = Math.max(subtotal - Number(discount || 0), 0);

  const checkout = async () => {
    if (cart.length === 0) return;

    await api.post("/sales", {
      items: cart.map((item) => ({ medicineId: item.medicineId, quantity: item.quantity })),
      discount: Number(discount || 0),
      paymentMethod
    });

    setCart([]);
    setDiscount(0);
    await load();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="card lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">POS - Medicines</h2>
          <input className="input max-w-xs" placeholder="Search medicine" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {filteredMeds.slice(0, 30).map((med) => (
            <button
              key={med._id}
              onClick={() => addToCart(med)}
              className="rounded-lg border border-slate-200 p-3 text-left hover:border-brand-600 dark:border-slate-700"
              disabled={med.quantityInStock === 0}
            >
              <p className="font-medium">{med.medicineName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{med.category}</p>
              <p className="text-sm">{money(med.sellingPrice)} | Stock: {med.quantityInStock}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold">Cart</h2>
        <div className="mt-3 grid gap-2">
          {cart.map((item) => (
            <div key={item.medicineId} className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
              <p className="text-sm font-medium">{item.name}</p>
              <div className="mt-2 flex items-center gap-2">
                <input className="input" type="number" min="1" value={item.quantity} onChange={(e) => changeQty(item.medicineId, e.target.value)} />
                <p className="text-sm">{money(item.unitPrice * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-2">
          <input className="input" type="number" placeholder="Discount" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          <select className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="card">Card</option>
          </select>
          <p className="text-sm">Subtotal: {money(subtotal)}</p>
          <p className="text-sm font-semibold">Total: {money(total)}</p>
          <button className="button" onClick={checkout}>
            Complete Sale
          </button>
        </div>
      </div>

      <div className="card lg:col-span-3">
        <h2 className="mb-3 text-lg font-semibold">Recent Sales</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
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
              {sales.map((sale) => (
                <tr key={sale._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-2">{sale.saleId}</td>
                  <td className="p-2">{shortDate(sale.soldAt)}</td>
                  <td className="p-2">{sale.items.length}</td>
                  <td className="p-2">{sale.paymentMethod}</td>
                  <td className="p-2">{money(sale.totalAmount)}</td>
                  <td className="p-2">{sale.salesperson?.name || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
