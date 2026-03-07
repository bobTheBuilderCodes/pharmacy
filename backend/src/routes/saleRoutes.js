import { Router } from "express";
import { createSale, getSale, getSales } from "../controllers/saleController.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/", getSales);
router.get("/:id", getSale);
router.post("/", allowRoles("admin", "pharmacist"), createSale);

export default router;
