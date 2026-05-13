import prisma from "../config/prisma.js";

export const createRole = async (req, res) => {
  try {
    const { roleName, companyId } = req.body;

    const role = await prisma.jobRole.create({
      data: {
        roleName,
        companyId,
      },
    });

    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getRolesByCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const roles = await prisma.jobRole.findMany({
      where: {
        companyId: Number(id),
      },
    });

    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await prisma.jobRole.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        company: true,
      },
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};