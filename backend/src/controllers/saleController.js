import { Sale } from "../models/Sale.js";
import { Medicine } from "../models/Medicine.js";

const generateFiveDigitSaleId = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = String(Math.floor(Math.random() * 90000) + 10000);
    const exists = await Sale.exists({ saleId: candidate });
    if (!exists) return candidate;
  }

  return String(Date.now()).slice(-5);
};

export const createSale = async (req, res, next) => {
  const session = await Sale.startSession();

  try {
    const { items, discount = 0, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one item is required" });
    }

    session.startTransaction();

    const saleItems = [];
    let grossTotal = 0;

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId).session(session);
      if (!medicine) {
        await session.abortTransaction();
        return res.status(404).json({ message: `Medicine not found: ${item.medicineId}` });
      }

      if (medicine.quantityInStock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Insufficient stock for ${medicine.medicineName}`
        });
      }

      const unitPrice = medicine.sellingPrice;
      const lineTotal = unitPrice * Number(item.quantity);
      grossTotal += lineTotal;

      medicine.quantityInStock -= Number(item.quantity);
      await medicine.save({ session });

      saleItems.push({
        medicine: medicine._id,
        medicineName: medicine.medicineName,
        quantity: Number(item.quantity),
        unitPrice,
        lineTotal
      });
    }

    const totalAmount = Math.max(grossTotal - Number(discount || 0), 0);
    const saleId = await generateFiveDigitSaleId();

    const sale = await Sale.create(
      [
        {
          saleId,
          items: saleItems,
          discount,
          totalAmount,
          paymentMethod,
          salesperson: req.user._id
        }
      ],
      { session }
    );

    await session.commitTransaction();

    const result = await Sale.findById(sale[0]._id)
      .populate("salesperson", "name role")
      .populate("items.medicine", "medicineName")
      .lean();

    res.status(201).json(result);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const getSales = async (req, res, next) => {
  try {
    const sales = await Sale.find()
      .populate("salesperson", "name role")
      .sort({ soldAt: -1 });
    res.json(sales);
  } catch (error) {
    next(error);
  }
};

export const getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id).populate("salesperson", "name").populate("items.medicine", "medicineName");
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }
    res.json(sale);
  } catch (error) {
    next(error);
  }
};
