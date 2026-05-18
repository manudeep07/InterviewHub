import {Router} from "express";
import {
  createExperience,
  getExperiencesByRole,
  getExperienceById,
  getAllExperiences,
  searchExperiences
} from "../controllers/experienceController.js";
import { protectRoute, optionalAuth } from "../middlewares/authMiddleware.js";

const experienceRouter = Router();

experienceRouter.get("/all", optionalAuth, getAllExperiences);
experienceRouter.get("/search", optionalAuth, searchExperiences);
experienceRouter.get("/role/:id", optionalAuth, getExperiencesByRole);
experienceRouter.get("/:id", optionalAuth, getExperienceById);

experienceRouter.post("/", protectRoute, createExperience);

export default experienceRouter;