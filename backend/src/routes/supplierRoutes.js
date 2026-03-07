import { Router } from "express";
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier
} from "../controllers/supplierController.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/", getSuppliers);
router.post("/", allowRoles("admin", "pharmacist"), createSupplier);
router.put("/:id", allowRoles("admin", "pharmacist"), updateSupplier);
router.delete("/:id", allowRoles("admin"), deleteSupplier);

export default router;
