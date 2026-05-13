import { Router } from "express";
import { protectRoute } from "../middlewares/authMiddleware.js";
import { toggleUpvote, toggleBookmark, addComment, getUserBookmarks } from "../controllers/engagementController.js";

const engagementRouter = Router();

// Bookmark routes
engagementRouter.get("/bookmarks", protectRoute, getUserBookmarks);

// Experience engagement routes
engagementRouter.post("/experiences/:id/upvote", protectRoute, toggleUpvote);
engagementRouter.post("/experiences/:id/bookmark", protectRoute, toggleBookmark);
engagementRouter.post("/experiences/:id/comments", protectRoute, addComment);

export default engagementRouter;
