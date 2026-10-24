const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

const app = express();

const allowedOrigins = (
    process.env.FRONTEND_ORIGIN || "http://localhost:5173"
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.disable("x-powered-by");

app.use(helmet());

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Origin not allowed by CORS"));
        },
        credentials: true,
    })
);

app.use(
    express.json({
        limit: "1mb",
    })
);

app.use(
    express.urlencoded({
        extended: false,
        limit: "1mb",
    })
);

app.use(cookieParser());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests. Please try again later.",
    },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many authentication attempts. Please try again later.",
    },
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "AI Interview Preparation Platform",
    });
});

app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/interviews", interviewRouter);

app.use((req, res) => {
    res.status(404).json({
        message: "API endpoint not found.",
    });
});

// Centralized error handling, including upload errors.
app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    if (error.name === "MulterError") {
        const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;

        return res.status(status).json({
            message:
                status === 413
                    ? "Uploaded file exceeds the permitted size."
                    : "The file upload could not be processed.",
        });
    }

    if (error.message === "Only PDF resume files are supported.") {
        return res.status(400).json({
            message: error.message,
        });
    }

    if (error.type === "entity.parse.failed") {
        return res.status(400).json({
            message: "Invalid JSON request body.",
        });
    }

    if (error.type === "entity.too.large") {
        return res.status(413).json({
            message: "Request body is too large.",
        });
    }

    if (error.message === "Origin not allowed by CORS") {
        return res.status(403).json({
            message: "This request origin is not permitted.",
        });
    }

    console.error("Unhandled application error:", error.message);

    return res.status(500).json({
        message: "An unexpected server error occurred.",
    });
});

module.exports = app;