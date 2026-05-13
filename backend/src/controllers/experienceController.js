import prisma from "../config/prisma.js";


// create a new experience for a specific job role
export const createExperience = async (req, res) => {
  try {
    const {
      overallDifficulty,
      result,
      jobRoleId,
      rounds, // array of rounds
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const experience = await prisma.experience.create({
      data: {
        overallDifficulty,
        result,
        userId: Number(userId),
        jobRoleId: Number(jobRoleId),
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

    const experiences = await prisma.experience.findMany({
      where: {
        jobRoleId: Number(id),
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

    res.status(200).json(experiences);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


// get a specific experience by its id
export const getExperienceById = async (req, res) => {
  try {
    const { id } = req.params;  //experienceId

    const experience = await prisma.experience.findUnique({
      where: {
        id: Number(id),  
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,   
            email: true,
          },
        },
        jobRole: {
          include: {
            company: true,
          },
        },
        rounds: true,
        _count: {
          select: { upvotes: true, comments: true }
        },
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

    if (!experience) {
      return res.status(404).json({
        message: "Experience not found",
      });
    }

    res.status(200).json(experience);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// get all experiences (for global feed)
export const getAllExperiences = async (req, res) => {
  try {
    const experiences = await prisma.experience.findMany({
      include: {
        user: { select: { id: true, name: true } },
        jobRole: { include: { company: true } },
        rounds: true,
        _count: { select: { upvotes: true, comments: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.status(200).json(experiences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// search experiences
export const searchExperiences = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json([]);

    const experiences = await prisma.experience.findMany({
      where: {
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
    res.status(200).json(experiences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};