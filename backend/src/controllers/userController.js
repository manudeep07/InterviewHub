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

export const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            experiences: {
              where: { isAnonymous: false }
            },
            upvotes: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate "Reputation" as total upvotes on their experiences
    const totalUpvotes = await prisma.upvote.count({
      where: {
        experience: { userId: Number(id) }
      }
    });

    res.status(200).json({ ...user, totalUpvotes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserExperiences = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const targetUserId = req.params.id ? Number(req.params.id) : requesterId;

    if (!targetUserId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const whereClause = {
      userId: targetUserId,
    };

    // If viewing someone else's profile, hide anonymous experiences
    if (requesterId !== targetUserId) {
      whereClause.isAnonymous = false;
    }

    const experiences = await prisma.experience.findMany({
      where: whereClause,
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
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user stats
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        name: true,
        _count: {
          select: {
            experiences: true,
            bookmarks: true,
            upvotes: true,
          }
        }
      }
    });

    // Get trending experiences
    const trendingExperiences = await prisma.experience.findMany({
      take: 5,
      include: {
        jobRole: { include: { company: true } },
        _count: { select: { upvotes: true, comments: true } }
      },
      orderBy: { upvotes: { _count: 'desc' } }
    });

    // Get recent activity (from other users)
    const recentActivity = await prisma.experience.findMany({
      take: 5,
      where: { userId: { not: Number(userId) } },
      include: {
        user: { select: { name: true } },
        jobRole: { include: { company: true } },
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      user,
      trendingExperiences,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
