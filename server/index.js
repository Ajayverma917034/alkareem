import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUploader from "express-fileupload";

// Routes
import ErrorHandler from "./middleware/Errors.js";

import UserRouter from './routes/user.route.js'
import AdminRouter from './routes/admin.route.js'
import WebRouter from './routes/web.routes.js'

import { findImage } from "./utils/uploadImage.js";

process.env.TZ = "Asia/Kolkata";

const app = express();

/* =========================
   🔧 Middlewares
========================= */

app.use(
    fileUploader({
        limits: { fileSize: 10 * 1024 * 1024 },
    })
);

app.use(
    cors({
        origin: [
            process.env.FRONTEND_URL,
            process.env.FRONTEND_URL_PROD,
            process.env.FRONTEND_URL_PROD2,
            process.env.ADMIN_URL,
            process.env.EMPLOYEE_URL,
        ],
        credentials: true,
    })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =========================
   📦 Routes
========================= */

app.use("/user", UserRouter)
app.use("/admin", AdminRouter)
app.use("/user/web", WebRouter)
app.get(/^\/image\/(.+)$/, findImage);

app.get("/", (req, res) => {
    res.json({ message: "API running successfully 🚀" });
});

/* =========================
   ❌ Error Handling
========================= */

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

app.use(ErrorHandler);

/* =========================
   🗄️ Database + Server Start
========================= */

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

mongoose
    .connect(MONGO_URL)
    .then(() => {
        console.log("✅ MongoDB connected");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB error:", err);
        process.exit(1);
    });