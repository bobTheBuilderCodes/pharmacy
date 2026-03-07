import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    medicineName: { type: String, required: true, trim: true },
    brandName: { type: String, trim: true },
    genericName: { type: String, trim: true },
    category: { type: String, trim: true, required: true },
    batchNumber: { type: String, trim: true },
    expiryDate: { type: Date, required: true },
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    quantityInStock: { type: Number, required: true, min: 0, default: 0 },
    minimumStockLevel: { type: Number, required: true, min: 0, default: 5 },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    barcodeSku: { type: String, trim: true, unique: true, sparse: true },
    dateAdded: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

medicineSchema.index({ medicineName: "text", genericName: "text", brandName: "text", category: "text" });
medicineSchema.index({ category: 1, expiryDate: 1, supplier: 1 });

export const Medicine = mongoose.model("Medicine", medicineSchema);
