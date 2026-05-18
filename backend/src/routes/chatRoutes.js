import { Router } from "express";
import { 
  requestChat, 
  handleChatRequest, 
  blockChat, 
  sendMessage, 
  getMyConversations, 
  getMessages 
} from "../controllers/chatController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const chatRouter = Router();

chatRouter.use(protectRoute);

chatRouter.get("/my-chats", getMyConversations);
chatRouter.get("/messages/:conversationId", getMessages);
chatRouter.post("/request", requestChat);
chatRouter.post("/handle-request", handleChatRequest);
chatRouter.post("/block", blockChat);
chatRouter.post("/send", sendMessage);

export default chatRouter;
