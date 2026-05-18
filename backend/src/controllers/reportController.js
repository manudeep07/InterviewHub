import prisma from "../config/prisma.js";

export const createReport = async (req, res) => {
  const { experienceId, reason } = req.body;
  const reporterId = req.user.id;

  try {
    const report = await prisma.report.create({
      data: {
        reason,
        experienceId: parseInt(experienceId),
        reporterId
      }
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
