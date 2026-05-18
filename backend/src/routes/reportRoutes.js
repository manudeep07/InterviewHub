import express from "express";
import { createReport } from "../controllers/reportController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protectRoute, createReport);

export default router;
