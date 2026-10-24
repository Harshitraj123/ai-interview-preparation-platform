const express = require("express");

const {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
} = require("../controllers/auth.controller");

const { authUser } = require("../middlewares/auth.middleware");

const router = express.Router();

// Register a new account.
router.post("/register", registerUser);

// Authenticate an existing account.
router.post("/login", loginUser);

// Invalidate the current session.
router.post("/logout", logoutUser);

// Return the authenticated user's profile.
router.get("/me", authUser, getCurrentUser);

module.exports = router;