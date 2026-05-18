import express from "express";
import { 
  getAdminStats, 
  getAllUsers, 
  updateUserRole, 
  deleteUser,
  getAllExperiences,
  moderateExperience,
  getAllReports,
  resolveReport,
  createCompany,
  deleteCompany,
  createJobRole,
  updateSecurityPolicy
} from "../controllers/adminController.js";
import { protectRoute, restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes here require ADMIN role
router.use(protectRoute);
router.use(restrictTo("ADMIN"));

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.patch("/users/role", updateUserRole);
router.delete("/users/:id", deleteUser);

router.get("/experiences", getAllExperiences);
router.patch("/experiences/:id/moderate", moderateExperience);

router.get("/reports", getAllReports);
router.patch("/reports/:id/resolve", resolveReport);

router.post("/companies", createCompany);
router.delete("/companies/:id", deleteCompany);
router.post("/job-roles", createJobRole);

router.post("/security/policy", updateSecurityPolicy);

export default router;
