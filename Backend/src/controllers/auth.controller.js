const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const TokenBlacklist = require("../models/blacklist.model");

const COOKIE_NAME = "token";
const TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;

function getCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: TOKEN_LIFETIME_MS,
    };
}

function createAccessToken(user) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured.");
    }

    return jwt.sign(
        {
            id: user._id.toString(),
            username: user.username,
        },
        secret,
        { expiresIn: "1d" }
    );
}

function formatPublicUser(user) {
    return {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
    };
}

function handleControllerError(res, error, operation) {
    console.error(`${operation} failed:`, error.message);

    if (error.code === 11000) {
        return res.status(409).json({
            message: "An account with these details already exists.",
        });
    }

    return res.status(500).json({
        message: "An unexpected server error occurred.",
    });
}

async function registerUser(req, res) {
    try {
        const { username, email, password } = req.body;

        if (
            typeof username !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Username, email, and password are required.",
            });
        }

        const normalizedUsername = username.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (normalizedUsername.length < 3 ||
            normalizedUsername.length > 30) {
            return res.status(400).json({
                message: "Username must contain between 3 and 30 characters.",
            });
        }

        if (password.length < 8 || password.length > 128) {
            return res.status(400).json({
                message: "Password must contain between 8 and 128 characters.",
            });
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Enter a valid email address.",
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { username: normalizedUsername },
                { email: normalizedEmail },
            ],
        });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this username or email already exists.",
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            username: normalizedUsername,
            email: normalizedEmail,
            password: passwordHash,
        });

        const token = createAccessToken(user);

        res.cookie(COOKIE_NAME, token, getCookieOptions());

        return res.status(201).json({
            message: "Account created successfully.",
            user: formatPublicUser(user),
        });
    } catch (error) {
        return handleControllerError(res, error, "Registration");
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail,
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        const token = createAccessToken(user);

        res.cookie(COOKIE_NAME, token, getCookieOptions());

        return res.status(200).json({
            message: "Login successful.",
            user: formatPublicUser(user),
        });
    } catch (error) {
        return handleControllerError(res, error, "Login");
    }
}

async function logoutUser(req, res) {
    try {
        const token = req.cookies?.[COOKIE_NAME];

        if (token) {
            await TokenBlacklist.updateOne(
                { token },
                { $setOnInsert: { token } },
                { upsert: true }
            );
        }

        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return res.status(200).json({
            message: "Logout successful.",
        });
    } catch (error) {
        return handleControllerError(res, error, "Logout");
    }
}

async function getCurrentUser(req, res) {
    try {
        if (!req.user?.id) {
            return res.status(401).json({
                message: "Authentication is required.",
            });
        }

        const user = await User.findById(req.user.id)
            .select("username email");

        if (!user) {
            return res.status(404).json({
                message: "User account not found.",
            });
        }

        return res.status(200).json({
            user: formatPublicUser(user),
        });
    } catch (error) {
        return handleControllerError(res, error, "Current-user lookup");
    }
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
};