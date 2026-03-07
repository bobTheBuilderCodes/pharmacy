import { Router } from "express";
import { login, me, register } from "../controllers/authController.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = Router();

router.post("/login", login);
router.post("/register", protect, allowRoles("admin"), register);
router.get("/me", protect, me);

export default router;
