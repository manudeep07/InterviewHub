import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import companyRouter from "./routes/companyRoutes.js";
import roleRouter from "./routes/roleRoutes.js";
import authenticationRouter from "./routes/authRoutes.js";
import experienceRouter from "./routes/experienceRoutes.js";
import roundRouter from "./routes/roundRoutes.js";
import engagementRouter from "./routes/engagementRoutes.js";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import reportRouter from "./routes/reportRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// registering routes
app.use('/companies',companyRouter);
app.use('/roles',roleRouter);
app.use('/auth',authenticationRouter);
app.use('/experiences',experienceRouter);
app.use('/rounds',roundRouter);
app.use('/engagement',engagementRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/notifications', notificationRouter);
app.use('/chat', chatRouter);
app.use('/reports', reportRouter);

// sample route
app.get("/", (req, res) => {
  res.send("InterviewHub API Running");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});
console.log("updated");
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});