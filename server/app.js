import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { v2 as cloudinary } from "cloudinary";

import { errorHandler } from "./middlewares/errorMiddleware.js";
import { requestLogger } from "./middlewares/requestLogger.js";

import authRouter       from "./routes/authRoutes.js";
import userRouter       from "./routes/userRoutes.js";
import doctorRouter     from "./routes/doctorRoutes.js";
import appointmentRouter from "./routes/appointmentRoutes.js";
import messageRouter    from "./routes/messageRoutes.js";
import departmentRouter from "./routes/departmentRoutes.js";
import reportRouter        from "./routes/reportRoutes.js";
import analyticsRouter     from "./routes/analyticsRoutes.js";
import notificationRouter  from "./routes/notificationRoutes.js";
import publicRouter        from "./routes/publicRoutes.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use(
  fileUpload({
    useTempFiles:  true,
    tempFileDir:   "/tmp/",
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 },
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(requestLogger);
}

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "MediFlow API",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

const API = "/api/v1";

app.use(`${API}/auth`,         authRouter);
app.use(`${API}/users`,        userRouter);
app.use(`${API}/doctors`,      doctorRouter);
app.use(`${API}/appointments`, appointmentRouter);
app.use(`${API}/messages`,     messageRouter);
app.use(`${API}/departments`,  departmentRouter);
app.use(`${API}/reports`,        reportRouter);
app.use(`${API}/analytics`,      analyticsRouter);
app.use(`${API}/notifications`,  notificationRouter);
app.use(`${API}/public`,         publicRouter);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

app.use(errorHandler);

export default app;
