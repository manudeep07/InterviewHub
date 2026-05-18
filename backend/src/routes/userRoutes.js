import express from "express";
import { getProfile, getPublicProfile, getUserExperiences, getDashboardData } from "../controllers/userController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/profile", protectRoute, getProfile);
router.get("/profile/:id", protectRoute, getPublicProfile);
router.get("/experiences/:id", protectRoute, getUserExperiences);
router.get("/dashboard", protectRoute, getDashboardData);

export default router;
