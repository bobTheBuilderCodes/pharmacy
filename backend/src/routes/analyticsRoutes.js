import { Router } from "express";
import {
  getDashboardAnalytics,
  getMovementAnalytics,
  getSalesCategoryAnalytics
} from "../controllers/analyticsController.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = Router();

router.use(protect, allowRoles("admin", "pharmacist"));
router.get("/dashboard", getDashboardAnalytics);
router.get("/sales-categories", getSalesCategoryAnalytics);
router.get("/movement", getMovementAnalytics);

export default router;
