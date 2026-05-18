import prisma from "../config/prisma.js";
import { createNotification } from "../utils/notificationService.js";

// Request a chat invitation
export const requestChat = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (Number(senderId) === Number(receiverId)) {
      return res.status(400).json({ message: "You cannot chat with yourself" });
    }

    // Check if a conversation already exists
    const existingChat = await prisma.conversation.findFirst({
      where: {
        OR: [
          { senderId: Number(senderId), receiverId: Number(receiverId) },
          { senderId: Number(receiverId), receiverId: Number(senderId) }
        ]
      }
    });

    if (existingChat) {
      if (existingChat.status === "BLOCKED") {
        return res.status(403).json({ message: "Communication blocked" });
      }
      return res.status(400).json({ message: "Chat request already exists or active" });
    }

    const conversation = await prisma.conversation.create({
      data: {
        senderId: Number(senderId),
        receiverId: Number(receiverId),
        status: "PENDING"
      }
    });

    // Notify receiver
    const sender = await prisma.user.findUnique({ where: { id: Number(senderId) }, select: { name: true } });
    await createNotification(
      Number(receiverId),
      "CHAT_REQUEST",
      `${sender.name} sent you a chat invitation`,
      senderId
    );

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Accept or Reject chat request
export const handleChatRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId, action } = req.body; // action: 'ACCEPTED' or 'REJECTED'

    if (!['ACCEPTED', 'REJECTED'].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: Number(chatId) }
    });

    if (!conversation || conversation.receiverId !== Number(userId)) {
      return res.status(404).json({ message: "Chat request not found" });
    }

    const updatedChat = await prisma.conversation.update({
      where: { id: Number(chatId) },
      data: { status: action }
    });

    if (action === 'ACCEPTED') {
      const receiver = await prisma.user.findUnique({ where: { id: Number(userId) }, select: { name: true } });
      await createNotification(
        conversation.senderId,
        "CHAT_ACCEPTED",
        `${receiver.name} accepted your chat invitation`,
        userId
      );
    }

    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Block a user (can be done from a conversation)
export const blockChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.body;

    const conversation = await prisma.conversation.findUnique({
      where: { id: Number(chatId) }
    });

    if (!conversation || (conversation.senderId !== Number(userId) && conversation.receiverId !== Number(userId))) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const updatedChat = await prisma.conversation.update({
      where: { id: Number(chatId) },
      data: { status: "BLOCKED" }
    });

    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId, content } = req.body;

    const conversation = await prisma.conversation.findUnique({
      where: { id: Number(conversationId) }
    });

    if (!conversation || conversation.status !== "ACCEPTED") {
      return res.status(403).json({ message: "Chat not active or accepted" });
    }

    if (conversation.senderId !== Number(senderId) && conversation.receiverId !== Number(senderId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: Number(conversationId),
        senderId: Number(senderId),
        content
      },
      include: {
        sender: { select: { id: true, name: true } }
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: Number(conversationId) },
      data: { updatedAt: new Date() }
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all conversations for a user
export const getMyConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { senderId: Number(userId) },
          { receiverId: Number(userId) }
        ]
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get messages for a specific conversation
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id: Number(conversationId) }
    });

    if (!conversation || (conversation.senderId !== Number(userId) && conversation.receiverId !== Number(userId))) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: Number(conversationId) },
      include: {
        sender: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
