import prisma from "../config/prisma.js";

export const createRound = async (req, res) => {
  try {
    const {
      roundType,
      title,
      questions,
      topics,
      difficulty,
      experienceId,
    } = req.body;

    const round = await prisma.round.create({
      data: {
        roundType,
        title,
        questions,
        topics,
        difficulty,
        experienceId,
      },
    });

    res.status(201).json(round);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getRoundsByExperience = async (req, res) => {
  try {
    const { id } = req.params;

    const rounds = await prisma.round.findMany({
      where: {
        experienceId: Number(id),
      },
    });

    res.status(200).json(rounds);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};