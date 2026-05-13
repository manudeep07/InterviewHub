import prisma from "../config/prisma.js";

export const getAdminStats = async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const companyCount = await prisma.company.count();
    const experienceCount = await prisma.experience.count();
    const commentCount = await prisma.comment.count();

    res.status(200).json({
      users: userCount,
      companies: companyCount,
      experiences: experienceCount,
      comments: commentCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
