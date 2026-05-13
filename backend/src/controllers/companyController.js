import prisma from "../config/prisma.js";

// Create a new company
export const createCompany = async (req, res) => {
  try {
    const { name, logo, description, website } = req.body;

    const company = await prisma.company.create({
      data: {
        name,
        logo,
        description,
        website,
      },
    });

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Get all companies
export const getCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany();

    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Get company by ID
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};