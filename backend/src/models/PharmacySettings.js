import mongoose from "mongoose";

const pharmacySettingsSchema = new mongoose.Schema(
  {
    pharmacyName: { type: String, default: "My Pharmacy" },
    contactEmail: { type: String, trim: true, lowercase: true, default: "" },
    contactPhone: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
    logoUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

export const PharmacySettings = mongoose.model("PharmacySettings", pharmacySettingsSchema);
