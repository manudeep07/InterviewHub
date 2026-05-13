import { Router } from "express";
import { getCompanies,createCompany,getCompanyById } from "../controllers/companyController.js";

const companyRouter = Router();


companyRouter.post('/',createCompany);
companyRouter.get('/',getCompanies);
companyRouter.get('/:id',getCompanyById);

export default companyRouter;