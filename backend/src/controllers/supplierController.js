import { Supplier } from "../models/Supplier.js";

export const createSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
};

export const getSuppliers = async (req, res, next) => {
  try {
    const search = req.query.search?.trim();
    const filter = search
      ? {
          $or: [
            { supplierName: { $regex: search, $options: "i" } },
            { contactPerson: { $regex: search, $options: "i" } },
            { phoneNumber: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const suppliers = await Supplier.find(filter).sort({ supplierName: 1 });
    res.json(suppliers);
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json({ message: "Supplier deleted" });
  } catch (error) {
    next(error);
  }
};
