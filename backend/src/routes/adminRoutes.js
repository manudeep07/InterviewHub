import express from "express";
import { getAdminStats, getAllUsers } from "../controllers/adminController.js";
import { protectRoute, restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/stats", protectRoute, restrictTo("ADMIN"), getAdminStats);
router.get("/users", protectRoute, restrictTo("ADMIN"), getAllUsers);

export default router;
