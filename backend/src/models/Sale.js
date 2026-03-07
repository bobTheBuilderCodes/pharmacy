import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    medicineName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    saleId: { type: String, required: true, unique: true },
    items: { type: [saleItemSchema], required: true },
    discount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["cash", "mobile_money", "card"], required: true },
    salesperson: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    soldAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

saleSchema.index({ soldAt: -1 });

export const Sale = mongoose.model("Sale", saleSchema);
