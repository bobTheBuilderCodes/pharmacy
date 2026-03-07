import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    purchaseId: { type: String, required: true, unique: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    quantity: { type: Number, required: true, min: 1 },
    purchasePrice: { type: Number, required: true, min: 0 },
    batchNumber: { type: String, trim: true },
    expiryDate: { type: Date, required: true },
    purchaseDate: { type: Date, required: true, default: Date.now }
  },
  { timestamps: true }
);

purchaseSchema.index({ purchaseDate: -1 });

export const Purchase = mongoose.model("Purchase", purchaseSchema);
