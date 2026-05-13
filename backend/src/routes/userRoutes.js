import express from "express";
import { getProfile, getUserExperiences } from "../controllers/userController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/profile", protectRoute, getProfile);
router.get("/my-experiences", protectRoute, getUserExperiences);

export default router;
