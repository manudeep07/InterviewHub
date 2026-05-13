import prisma from "../config/prisma.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await prisma.notification.findMany({
      where: { userId: Number(userId) },
      include: {
        sender: {
          select: { name: true, email: true }
        },
        experience: {
          select: { 
            id: true,
            jobRole: {
              include: { company: { select: { name: true } } }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const unreadCount = await prisma.notification.count({
      where: { 
        userId: Number(userId),
        isRead: false
      }
    });

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.updateMany({
      where: { 
        id: Number(id),
        userId: Number(userId)
      },
      data: { isRead: true }
    });

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId: Number(userId) },
      data: { isRead: true }
    });

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
