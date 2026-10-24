const mongoose = require("mongoose");

const tokenBlacklistSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: [true, "Authentication token is required."],
            unique: true,
            immutable: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const TokenBlacklist =
    mongoose.models.TokenBlacklist ||
    mongoose.model("TokenBlacklist", tokenBlacklistSchema);

module.exports = TokenBlacklist;