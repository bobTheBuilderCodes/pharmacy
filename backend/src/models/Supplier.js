import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    supplierName: { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    medicinesSupplied: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

supplierSchema.index({ supplierName: 1 });

export const Supplier = mongoose.model("Supplier", supplierSchema);
