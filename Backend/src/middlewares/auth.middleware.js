const jwt = require("jsonwebtoken");
const TokenBlacklist = require("../models/blacklist.model");

async function authUser(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Please log in.",
        });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        console.error("JWT_SECRET is not configured.");

        return res.status(500).json({
            success: false,
            message: "Authentication service is not configured.",
        });
    }

    try {
        const blacklisted = await TokenBlacklist.exists({ token });

        if (blacklisted) {
            return res.status(401).json({
                success: false,
                message: "Your session is no longer valid. Please log in again.",
            });
        }
    } catch (error) {
        console.error("Token blacklist lookup failed:", error.message);

        return res.status(503).json({
            success: false,
            message: "Authentication service is temporarily unavailable.",
        });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);

        if (!decoded.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token.",
            });
        }

        req.user = {
            id: decoded.id,
            username: decoded.username,
        };

        return next();
    } catch (error) {
        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Your session is invalid or expired. Please log in again.",
            });
        }

        console.error("Authentication failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "An unexpected authentication error occurred.",
        });
    }
}

module.exports = { authUser };