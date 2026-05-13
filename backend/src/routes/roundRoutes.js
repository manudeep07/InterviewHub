import { Router } from "express";
import { createRound, getRoundsByExperience } from "../controllers/roundController.js";

const roundRouter = Router();

roundRouter.post("/", createRound);

roundRouter.get("/experience/:id", getRoundsByExperience);

export default roundRouter;