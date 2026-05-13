import prisma from "../config/prisma.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            experiences: true,
            bookmarks: true,
            upvotes: true,
            comments: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserExperiences = async (req, res) => {
  try {
    const userId = req.user.id;

    const experiences = await prisma.experience.findMany({
      where: { userId: Number(userId) },
      include: {
        jobRole: {
          include: { company: true }
        },
        _count: {
          select: { upvotes: true, comments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(experiences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
