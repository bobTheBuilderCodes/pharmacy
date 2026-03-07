import { Router } from "express";
import { createPurchase, getPurchases } from "../controllers/purchaseController.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/", getPurchases);
router.post("/", allowRoles("admin", "pharmacist"), createPurchase);

export default router;
