
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();


app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use((req, res, next) => {
    console.log(`Method: ${req.method}, URL: ${req.url}`);
    next();
});

// Import routes
import userRouter from './routes/user.routes.js';
// Routes declaration
app.use("/api/v1/users", userRouter);

// Global Error Handler (Optional but highly recommended)
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || []
    });
});

export { app };