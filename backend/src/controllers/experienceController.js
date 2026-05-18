import prisma from "../config/prisma.js";

// Helper to sanitize experiences for anonymity
const sanitizeExperience = (exp, currentUserId) => {
  if (exp.isAnonymous && exp.userId !== currentUserId) {
    return {
      ...exp,
      user: { id: null, name: "Anonymous User" }
    };
  }
  return exp;
};

// create a new experience for a specific job role
export const createExperience = async (req, res) => {
  try {
    const {
      overallDifficulty,
      result,
      jobRoleId,
      customRoleName,
      companyId,
      isAnonymous,
      rounds, // array of rounds
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let finalJobRoleId = jobRoleId;

    // Handle dynamic role creation
    if (jobRoleId === "new" || !jobRoleId) {
      if (!customRoleName || !companyId) {
        return res.status(400).json({ message: "Custom role name and company ID are required for new roles" });
      }

      // Check if role already exists for this company (case-insensitive)
      let role = await prisma.jobRole.findFirst({
        where: {
          roleName: { equals: customRoleName, mode: 'insensitive' },
          companyId: Number(companyId)
        }
      });

      if (!role) {
        role = await prisma.jobRole.create({
          data: {
            roleName: customRoleName,
            companyId: Number(companyId)
          }
        });
      }
      finalJobRoleId = role.id;
    }

    const experience = await prisma.experience.create({
      data: {
        overallDifficulty,
        result,
        userId: Number(userId),
        jobRoleId: Number(finalJobRoleId),
        isAnonymous: Boolean(isAnonymous),
        ...(rounds && rounds.length > 0 && {
          rounds: {
            create: rounds,
          },
        }),
      },
      include: {
        rounds: true,
      }
    });

    res.status(201).json(experience);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message,
    });
  }
};


// get all experiences for a specific job role
export const getExperiencesByRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { difficulty, result } = req.query;
    const currentUserId = req.user?.id;

    const experiences = await prisma.experience.findMany({
      where: {
        jobRoleId: Number(id),
        status: "APPROVED",
        ...(difficulty && { overallDifficulty: difficulty }),
        ...(result && { result: result }),
      },
      include: {
        user: {
            select: {
                id: true,
                name: true,
                email: true,
            }
        },
        rounds: true,
        jobRole: {
          include: {
            company: true,
          },
        },
        _count: {
          select: { upvotes: true, comments: true }
        },
        upvotes: true,
        bookmarks: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const sanitizedExperiences = experiences.map(exp => sanitizeExperience(exp, currentUserId));

    res.status(200).json(sanitizedExperiences);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// get all experiences (unified feed with filtering, sorting, and searching)
export const getAllExperiences = async (req, res) => {
  try {
    const { difficulty, result, companyId, search, sort, roleId } = req.query;
    const currentUserId = req.user?.id;

    const where = {
      status: "APPROVED",
      ...(difficulty && { overallDifficulty: difficulty }),
      ...(result && { result: result }),
      ...(companyId && { jobRole: { companyId: Number(companyId) } }),
      ...(roleId && { jobRoleId: Number(roleId) }),
      ...(search && {
        OR: [
          { jobRole: { roleName: { contains: search, mode: 'insensitive' } } },
          { jobRole: { company: { name: { contains: search, mode: 'insensitive' } } } },
          { rounds: { some: { questions: { hasSome: [search] } } } },
          { rounds: { some: { topics: { hasSome: [search] } } } },
          { rounds: { some: { roundName: { contains: search, mode: 'insensitive' } } } }
        ]
      })
    };

    let orderBy = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'most_upvotes') orderBy = { upvotes: { _count: 'desc' } };

    const experiences = await prisma.experience.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        jobRole: { include: { company: true } },
        rounds: true,
        _count: { select: { upvotes: true, comments: true } }
      },
      orderBy,
      take: 50 
    });

    const sanitizedExperiences = experiences.map(exp => sanitizeExperience(exp, currentUserId));

    res.status(200).json(sanitizedExperiences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get a specific experience by its id
export const getExperienceById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    const experience = await prisma.experience.findUnique({
      where: { id: Number(id) },
      include: {
        user: { 
          select: { 
            id: true, 
            name: true, 
            email: true,
            _count: {
              select: {
                experiences: { where: { isAnonymous: false } },
                upvotes: true
              }
            }
          } 
        },
        jobRole: { include: { company: true } },
        rounds: true,
        _count: { select: { upvotes: true, comments: true } },
        upvotes: true,
        bookmarks: true,
        comments: {
          include: {
            user: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
    });

    if (!experience || experience.status === "REMOVED") return res.status(404).json({ message: "Experience not found or removed" });

    let sanitizedExperience = sanitizeExperience(experience, currentUserId);

    // Sanitize comments if author is experience creator and it's anonymous
    if (experience.isAnonymous) {
      sanitizedExperience.comments = experience.comments.map(comment => {
        if (comment.userId === experience.userId) {
          return { ...comment, user: { id: null, name: "Author (Anonymous)" } };
        }
        return comment;
      });
    }

    res.status(200).json(sanitizedExperience);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// search experiences
export const searchExperiences = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user?.id;
    if (!q) return res.status(200).json([]);

    const experiences = await prisma.experience.findMany({
      where: {
        status: "APPROVED",
        OR: [
          { jobRole: { roleName: { contains: q, mode: 'insensitive' } } },
          { jobRole: { company: { name: { contains: q, mode: 'insensitive' } } } },
          { rounds: { some: { questions: { hasSome: [q] } } } },
          { rounds: { some: { topics: { hasSome: [q] } } } }
        ]
      },
      include: {
        user: { select: { id: true, name: true } },
        jobRole: { include: { company: true } },
        _count: { select: { upvotes: true, comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const sanitizedExperiences = experiences.map(exp => sanitizeExperience(exp, currentUserId));
    res.status(200).json(sanitizedExperiences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};