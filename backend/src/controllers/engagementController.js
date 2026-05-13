import prisma from "../config/prisma.js";
import { createNotification } from "../utils/notificationService.js";

// Toggle Upvote
export const toggleUpvote = async (req, res) => {
  try {
    const { id } = req.params; // experienceId
    const userId = req.user.id;

    const existingUpvote = await prisma.upvote.findUnique({
      where: {
        userId_experienceId: {
          userId: Number(userId),
          experienceId: Number(id),
        },
      },
    });

    if (existingUpvote) {
      // Remove upvote
      await prisma.upvote.delete({
        where: { id: existingUpvote.id },
      });
      return res.status(200).json({ message: "Upvote removed", upvoted: false });
    } else {
      // Add upvote
      await prisma.upvote.create({
        data: {
          userId: Number(userId),
          experienceId: Number(id),
        },
      });

      // Notify experience owner
      const experience = await prisma.experience.findUnique({
        where: { id: Number(id) },
        select: { userId: true, user: { select: { name: true } } }
      });
      
      if (experience) {
        const user = await prisma.user.findUnique({ where: { id: Number(userId) }, select: { name: true } });
        await createNotification(
          experience.userId,
          "UPVOTE",
          `${user.name} upvoted your interview experience`,
          userId,
          Number(id)
        );
      }

      return res.status(201).json({ message: "Upvoted successfully", upvoted: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle Bookmark
export const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params; // experienceId
    const userId = req.user.id;

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_experienceId: {
          userId: Number(userId),
          experienceId: Number(id),
        },
      },
    });

    if (existingBookmark) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      return res.status(200).json({ message: "Bookmark removed", bookmarked: false });
    } else {
      // Add bookmark
      await prisma.bookmark.create({
        data: {
          userId: Number(userId),
          experienceId: Number(id),
        },
      });
      return res.status(201).json({ message: "Bookmarked successfully", bookmarked: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Comment
export const addComment = async (req, res) => {
  try {
    const { id } = req.params; // experienceId
    const { content, parentId } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: Number(userId),
        experienceId: Number(id),
        parentId: parentId ? Number(parentId) : null,
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    // Handle Notifications
    const experience = await prisma.experience.findUnique({
      where: { id: Number(id) },
      select: { userId: true }
    });

    const commenter = await prisma.user.findUnique({ where: { id: Number(userId) }, select: { name: true } });

    if (parentId) {
      // It's a reply
      const parentComment = await prisma.comment.findUnique({
        where: { id: Number(parentId) },
        select: { userId: true }
      });
      if (parentComment) {
        await createNotification(
          parentComment.userId,
          "REPLY",
          `${commenter.name} replied to your comment`,
          userId,
          Number(id)
        );
      }
    } else {
      // It's a top-level comment, notify experience owner
      if (experience) {
        await createNotification(
          experience.userId,
          "COMMENT",
          `${commenter.name} commented on your experience`,
          userId,
          Number(id)
        );
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get User Bookmarks
export const getUserBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: Number(userId) },
      include: {
        experience: {
          include: {
            user: { select: { name: true } },
            jobRole: { include: { company: true } },
            rounds: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Extract the experiences out of the bookmarks
    const bookmarkedExperiences = bookmarks.map(b => ({
      ...b.experience,
      bookmarkId: b.id // keep the bookmark ID if needed
    }));

    res.status(200).json(bookmarkedExperiences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
