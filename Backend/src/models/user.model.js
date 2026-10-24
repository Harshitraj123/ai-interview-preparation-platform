const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required."],
            unique: true,
            trim: true,
            lowercase: true,
            minlength: 3,
            maxlength: 30,
        },

        email: {
            type: String,
            required: [true, "Email address is required."],
            unique: true,
            trim: true,
            lowercase: true,
            maxlength: 254,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address.",
            ],
        },

        password: {
            type: String,
            required: [true, "Password is required."],
            minlength: 8,
            maxlength: 128,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const User =
    mongoose.models.User ||
    mongoose.model("User", userSchema);

module.exports = User;