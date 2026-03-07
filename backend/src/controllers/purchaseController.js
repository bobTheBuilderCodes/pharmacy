import { Purchase } from "../models/Purchase.js";
import { Medicine } from "../models/Medicine.js";
import { generateCode } from "../utils/id.js";

export const createPurchase = async (req, res, next) => {
  const session = await Purchase.startSession();

  try {
    const { supplier, medicine, quantity, purchasePrice, batchNumber, expiryDate, purchaseDate } = req.body;

    session.startTransaction();

    const med = await Medicine.findById(medicine).session(session);
    if (!med) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Medicine not found" });
    }

    med.quantityInStock += Number(quantity);
    med.purchasePrice = purchasePrice;
    if (batchNumber) med.batchNumber = batchNumber;
    if (expiryDate) med.expiryDate = expiryDate;

    await med.save({ session });

    const purchase = await Purchase.create(
      [
        {
          purchaseId: generateCode("PUR"),
          supplier,
          medicine,
          quantity,
          purchasePrice,
          batchNumber,
          expiryDate,
          purchaseDate
        }
      ],
      { session }
    );

    await session.commitTransaction();

    const result = await Purchase.findById(purchase[0]._id)
      .populate("supplier", "supplierName")
      .populate("medicine", "medicineName")
      .lean();

    res.status(201).json(result);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const getPurchases = async (req, res, next) => {
  try {
    const purchases = await Purchase.find()
      .populate("supplier", "supplierName")
      .populate("medicine", "medicineName")
      .sort({ purchaseDate: -1 });

    res.json(purchases);
  } catch (error) {
    next(error);
  }
};
