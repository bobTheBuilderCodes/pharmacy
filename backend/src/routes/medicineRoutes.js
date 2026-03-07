import { Router } from "express";
import {
  createMedicine,
  deleteMedicine,
  getMedicine,
  getMedicines,
  getStockAlerts,
  updateMedicine
} from "../controllers/medicineController.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/alerts", getStockAlerts);
router.get("/", getMedicines);
router.get("/:id", getMedicine);
router.post("/", allowRoles("admin", "pharmacist"), createMedicine);
router.put("/:id", allowRoles("admin", "pharmacist"), updateMedicine);
router.delete("/:id", allowRoles("admin"), deleteMedicine);

export default router;
