const express = require("express");

const { authUser } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/file.middleware");

const {
    createInterviewReport,
    getInterviewReport,
    listInterviewReports,
    downloadResumePdf,
} = require("../controllers/interview.controller");

const router = express.Router();

// Generate an interview report from a resume and job description.
router.post(
    "/",
    authUser,
    upload.single("resume"),
    createInterviewReport
);

// Retrieve the authenticated user's interview history.
router.get(
    "/",
    authUser,
    listInterviewReports
);

// Retrieve one report belonging to the authenticated user.
router.get(
    "/:reportId",
    authUser,
    getInterviewReport
);

// Generate a tailored resume PDF from a saved report.
router.get(
    "/:reportId/pdf",
    authUser,
    downloadResumePdf
);

module.exports = router;