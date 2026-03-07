import { Medicine } from "../models/Medicine.js";

const normalizeMedicinePayload = (payload) => {
  const normalized = { ...payload };

  if (normalized.supplier === "") {
    normalized.supplier = undefined;
  }

  return normalized;
};

const buildMedicineFilter = ({ search, category, supplier, expiryFrom, expiryTo }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { medicineName: { $regex: search, $options: "i" } },
      { brandName: { $regex: search, $options: "i" } },
      { genericName: { $regex: search, $options: "i" } },
      { barcodeSku: { $regex: search, $options: "i" } }
    ];
  }

  if (category) filter.category = category;
  if (supplier) filter.supplier = supplier;

  if (expiryFrom || expiryTo) {
    filter.expiryDate = {};
    if (expiryFrom) filter.expiryDate.$gte = new Date(expiryFrom);
    if (expiryTo) filter.expiryDate.$lte = new Date(expiryTo);
  }

  return filter;
};

export const createMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.create(normalizeMedicinePayload(req.body));
    const populated = await medicine.populate("supplier", "supplierName phoneNumber");
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const getMedicines = async (req, res, next) => {
  try {
    const filter = buildMedicineFilter(req.query);
    const medicines = await Medicine.find(filter)
      .populate("supplier", "supplierName")
      .sort({ medicineName: 1 });
    res.json(medicines);
  } catch (error) {
    next(error);
  }
};

export const getMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate("supplier", "supplierName phoneNumber");
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }
    res.json(medicine);
  } catch (error) {
    next(error);
  }
};

export const updateMedicine = async (req, res, next) => {
  try {
    const updatePayload = normalizeMedicinePayload(req.body);
    const updateQuery =
      updatePayload.supplier === undefined
        ? { ...updatePayload, $unset: { supplier: 1 } }
        : updatePayload;

    const medicine = await Medicine.findByIdAndUpdate(req.params.id, updateQuery, {
      new: true,
      runValidators: true
    }).populate("supplier", "supplierName");

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.json(medicine);
  } catch (error) {
    next(error);
  }
};

export const deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }
    res.json({ message: "Medicine deleted" });
  } catch (error) {
    next(error);
  }
};

export const getStockAlerts = async (req, res, next) => {
  try {
    const now = new Date();
    const days = Number(req.query.days || 30);
    const expiryLimit = new Date(now);
    expiryLimit.setDate(expiryLimit.getDate() + days);

    const [lowStock, expired, expiringSoon, outOfStock] = await Promise.all([
      Medicine.find({ $expr: { $lte: ["$quantityInStock", "$minimumStockLevel"] } }).select("medicineName quantityInStock minimumStockLevel"),
      Medicine.find({ expiryDate: { $lt: now } }).select("medicineName expiryDate quantityInStock"),
      Medicine.find({ expiryDate: { $gte: now, $lte: expiryLimit } }).select("medicineName expiryDate quantityInStock"),
      Medicine.find({ quantityInStock: 0 }).select("medicineName category")
    ]);

    res.json({ lowStock, expired, expiringSoon, outOfStock });
  } catch (error) {
    next(error);
  }
};
