import {Router} from "express";
import {
  createExperience,
  getExperiencesByRole,
  getExperienceById,
  getAllExperiences,
  searchExperiences
} from "../controllers/experienceController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const experienceRouter = Router();

experienceRouter.get("/all", getAllExperiences);
experienceRouter.get("/search", searchExperiences);
experienceRouter.get("/role/:id", getExperiencesByRole);
experienceRouter.get("/:id", getExperienceById);

experienceRouter.post("/", protectRoute, createExperience);

export default experienceRouter;