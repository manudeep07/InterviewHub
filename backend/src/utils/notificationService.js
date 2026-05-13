import prisma from "../config/prisma.js";

/**
 * Create a system notification for a user
 * @param {number} userId - The recipient of the notification
 * @param {string} type - COMMENT, REPLY, UPVOTE, CHAT_INVITATION
 * @param {string} content - Message content
 * @param {number|null} senderId - The user who triggered the notification
 * @param {number|null} experienceId - Related experience ID
 */
export const createNotification = async (userId, type, content, senderId = null, experienceId = null) => {
  try {
    // Don't notify if the sender is the recipient
    if (userId === senderId) return null;

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        content,
        senderId,
        experienceId,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};
