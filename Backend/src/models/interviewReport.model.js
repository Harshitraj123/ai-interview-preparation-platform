const mongoose = require("mongoose");

const interviewReportSchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        resumeText: {
            type: String,
            required: true,
            maxlength: 100000,
        },

        candidateSummary: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },

        roleDescription: {
            type: String,
            required: true,
            trim: true,
            maxlength: 10000,
        },

        assessment: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

interviewReportSchema.index({
    ownerId: 1,
    createdAt: -1,
});

const InterviewReport =
    mongoose.models.InterviewReport ||
    mongoose.model("InterviewReport", interviewReportSchema);

module.exports = InterviewReport;