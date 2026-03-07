import { Router } from "express";
import {
  expiryReportCsv,
  inventoryReportCsv,
  profitReportPdf,
  salesReportCsv
} from "../controllers/reportController.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = Router();

router.use(protect, allowRoles("admin"));
router.get("/sales.csv", salesReportCsv);
router.get("/inventory.csv", inventoryReportCsv);
router.get("/expiry.csv", expiryReportCsv);
router.get("/profit.pdf", profitReportPdf);

export default router;
