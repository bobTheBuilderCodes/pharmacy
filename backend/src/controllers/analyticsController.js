import { Sale } from "../models/Sale.js";
import { Medicine } from "../models/Medicine.js";

const dateRangeFor = (days) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days + 1);
  return start;
};

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const todayStart = dateRangeFor(1);
    const weekStart = dateRangeFor(7);
    const monthStart = dateRangeFor(30);

    const [dailySales, weeklySales, monthlyRevenue, bestSelling, salesByStaff, lowStock, expired, totalInventoryValue] =
      await Promise.all([
        Sale.aggregate([{ $match: { soldAt: { $gte: todayStart } } }, { $group: { _id: null, value: { $sum: "$totalAmount" } } }]),
        Sale.aggregate([{ $match: { soldAt: { $gte: weekStart } } }, { $group: { _id: null, value: { $sum: "$totalAmount" } } }]),
        Sale.aggregate([{ $match: { soldAt: { $gte: monthStart } } }, { $group: { _id: null, value: { $sum: "$totalAmount" } } }]),
        Sale.aggregate([
          { $unwind: "$items" },
          { $group: { _id: "$items.medicineName", quantitySold: { $sum: "$items.quantity" } } },
          { $sort: { quantitySold: -1 } },
          { $limit: 5 }
        ]),
        Sale.aggregate([
          { $group: { _id: "$salesperson", totalSales: { $sum: "$totalAmount" }, transactions: { $sum: 1 } } },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "staff"
            }
          },
          { $unwind: "$staff" },
          { $project: { _id: 0, staffName: "$staff.name", totalSales: 1, transactions: 1 } },
          { $sort: { totalSales: -1 } }
        ]),
        Medicine.find({ $expr: { $lte: ["$quantityInStock", "$minimumStockLevel"] } }).select("medicineName quantityInStock minimumStockLevel"),
        Medicine.find({ expiryDate: { $lt: new Date() } }).select("medicineName expiryDate"),
        Medicine.aggregate([
          {
            $group: {
              _id: null,
              inventoryValue: { $sum: { $multiply: ["$quantityInStock", "$purchasePrice"] } },
              totalCost: { $sum: { $multiply: ["$quantityInStock", "$purchasePrice"] } }
            }
          }
        ])
      ]);

    const revenue = monthlyRevenue[0]?.value || 0;
    const cost = totalInventoryValue[0]?.totalCost || 0;

    res.json({
      salesAnalytics: {
        dailySales: dailySales[0]?.value || 0,
        weeklySales: weeklySales[0]?.value || 0,
        monthlyRevenue: revenue,
        bestSellingMedicines: bestSelling,
        salesByStaff
      },
      inventoryAnalytics: {
        lowStockMedicines: lowStock,
        expiredMedicines: expired,
        inventoryValue: totalInventoryValue[0]?.inventoryValue || 0
      },
      financialInsights: {
        totalRevenue: revenue,
        totalCostOfInventory: cost,
        estimatedProfit: revenue - cost
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesCategoryAnalytics = async (req, res, next) => {
  try {
    const data = await Sale.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "medicines",
          localField: "items.medicine",
          foreignField: "_id",
          as: "medicine"
        }
      },
      { $unwind: "$medicine" },
      { $group: { _id: "$medicine.category", total: { $sum: "$items.lineTotal" } } },
      { $project: { _id: 0, category: "$_id", total: 1 } },
      { $sort: { total: -1 } }
    ]);

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getMovementAnalytics = async (req, res, next) => {
  try {
    const windowStart = dateRangeFor(30);

    const movement = await Sale.aggregate([
      { $match: { soldAt: { $gte: windowStart } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.medicine", soldQty: { $sum: "$items.quantity" } } },
      {
        $lookup: {
          from: "medicines",
          localField: "_id",
          foreignField: "_id",
          as: "medicine"
        }
      },
      { $unwind: "$medicine" },
      {
        $project: {
          _id: 0,
          medicineName: "$medicine.medicineName",
          soldQty: 1
        }
      },
      { $sort: { soldQty: -1 } }
    ]);

    const fastMoving = movement.slice(0, 10);
    const slowMoving = [...movement].reverse().slice(0, 10);

    res.json({ fastMoving, slowMoving });
  } catch (error) {
    next(error);
  }
};
