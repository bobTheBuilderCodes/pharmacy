import PDFDocument from "pdfkit";
import { Sale } from "../models/Sale.js";
import { Medicine } from "../models/Medicine.js";

const asCsv = (rows) => {
  if (rows.length === 0) return "";

  const headers = Object.keys(rows[0]);
  const escaped = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((h) => escaped(row[h])).join(","));
  });

  return lines.join("\n");
};

export const salesReportCsv = async (req, res, next) => {
  try {
    const sales = await Sale.find().populate("salesperson", "name").sort({ soldAt: -1 });
    const rows = sales.map((sale) => ({
      saleId: sale.saleId,
      soldAt: sale.soldAt.toISOString(),
      items: sale.items.length,
      discount: sale.discount,
      totalAmount: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
      salesperson: sale.salesperson?.name || "N/A"
    }));

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=sales-report.csv");
    res.send(asCsv(rows));
  } catch (error) {
    next(error);
  }
};

export const inventoryReportCsv = async (req, res, next) => {
  try {
    const medicines = await Medicine.find().populate("supplier", "supplierName").sort({ medicineName: 1 });
    const rows = medicines.map((med) => ({
      medicineName: med.medicineName,
      category: med.category,
      quantityInStock: med.quantityInStock,
      minStock: med.minimumStockLevel,
      purchasePrice: med.purchasePrice,
      sellingPrice: med.sellingPrice,
      expiryDate: med.expiryDate.toISOString().split("T")[0],
      supplier: med.supplier?.supplierName || "N/A"
    }));

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=inventory-report.csv");
    res.send(asCsv(rows));
  } catch (error) {
    next(error);
  }
};

export const expiryReportCsv = async (req, res, next) => {
  try {
    const medicines = await Medicine.find().sort({ expiryDate: 1 });
    const rows = medicines.map((med) => {
      const daysLeft = Math.ceil((new Date(med.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return {
        medicineName: med.medicineName,
        category: med.category,
        expiryDate: med.expiryDate.toISOString().split("T")[0],
        quantityInStock: med.quantityInStock,
        status: daysLeft < 0 ? "expired" : daysLeft <= 30 ? "expiring_30_days" : "active"
      };
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=expiry-report.csv");
    res.send(asCsv(rows));
  } catch (error) {
    next(error);
  }
};

export const profitReportPdf = async (req, res, next) => {
  try {
    const [revenueAgg, inventoryAgg] = await Promise.all([
      Sale.aggregate([{ $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }]),
      Medicine.aggregate([
        {
          $group: {
            _id: null,
            totalCost: { $sum: { $multiply: ["$quantityInStock", "$purchasePrice"] } }
          }
        }
      ])
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const totalCost = inventoryAgg[0]?.totalCost || 0;
    const estimatedProfit = totalRevenue - totalCost;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=profit-report.pdf");

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(18).text("Pharmacy Profit Report", { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Generated At: ${new Date().toISOString()}`);
    doc.moveDown();
    doc.text(`Total Revenue: ${totalRevenue.toFixed(2)}`);
    doc.text(`Total Cost Of Inventory: ${totalCost.toFixed(2)}`);
    doc.text(`Estimated Profit: ${estimatedProfit.toFixed(2)}`);

    doc.end();
  } catch (error) {
    next(error);
  }
};
