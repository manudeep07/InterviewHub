import { Router } from "express";
import { createRole, getRolesByCompany, getRoleById } from "../controllers/roleController.js";

const roleRouter = Router();

roleRouter.post('/', createRole);
roleRouter.get('/:id', getRoleById);
roleRouter.get('/company/:id', getRolesByCompany);

export default roleRouter;