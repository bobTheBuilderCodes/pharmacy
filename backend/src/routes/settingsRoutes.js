import { Router } from "express";
import { getSettings, upsertSettings } from "../controllers/settingsController.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = Router();

router.get("/", getSettings);
router.use(protect);
router.put("/", allowRoles("admin"), upsertSettings);

export default router;
