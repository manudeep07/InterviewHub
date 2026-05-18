import prisma from "../config/prisma.js";

// --- Dashboard Stats ---
export const getAdminStats = async (req, res) => {
  try {
    const [userCount, companyCount, experienceCount, commentCount, pendingReports] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.experience.count(),
      prisma.comment.count(),
      prisma.report.count({ where: { status: "PENDING" } })
    ]);

    res.status(200).json({
      users: userCount,
      companies: companyCount,
      experiences: experienceCount,
      comments: commentCount,
      pendingReports
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- User Management ---
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { experiences: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  const { userId, role } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role }
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Experience Moderation ---
export const getAllExperiences = async (req, res) => {
  try {
    const experiences = await prisma.experience.findMany({
      include: {
        user: { select: { name: true, email: true } },
        jobRole: {
          include: { company: true }
        },
        _count: { select: { reports: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(experiences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const moderateExperience = async (req, res) => {
  const { id } = req.params;
  const { status, message } = req.body; // status: APPROVED, REMOVED

  try {
    const experience = await prisma.experience.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { user: true }
    });

    // Send moderation notification
    if (message) {
      await prisma.notification.create({
        data: {
          type: "MODERATION",
          content: message,
          userId: experience.userId,
          experienceId: experience.id
        }
      });
    }

    res.status(200).json(experience);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Reports Management ---
export const getAllReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: { select: { name: true } },
        experience: {
          include: {
            user: { select: { name: true } },
            jobRole: { include: { company: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resolveReport = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // RESOLVED, DISMISSED

  try {
    const report = await prisma.report.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Company & Role Management ---
export const createCompany = async (req, res) => {
  const { name, logo, description, website } = req.body;
  try {
    const company = await prisma.company.create({
      data: { name, logo, description, website }
    });
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCompany = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.company.delete({
      where: { id: parseInt(id) }
    });
    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createJobRole = async (req, res) => {
  const { roleName, companyId } = req.body;
  try {
    const jobRole = await prisma.jobRole.create({
      data: { roleName, companyId: parseInt(companyId) }
    });
    res.status(201).json(jobRole);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSecurityPolicy = async (req, res) => {
  try {
    // In a real application, you might update global settings or emit an event
    res.status(200).json({ message: "Security policy updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
