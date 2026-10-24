const mongoose = require("mongoose");
const { PDFParse } = require("pdf-parse");

const InterviewReport = require("../models/interviewReport.model");

const {
    generateInterviewReport,
    generateResumePdf,
} = require("../services/ai.service");

const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const MAX_EXTRACTED_TEXT_LENGTH = 100000;

async function extractResumeText(buffer) {
    const parser = new PDFParse({
        data: buffer,
    });

    try {
        const result = await parser.getText();
        return result.text.trim();
    } finally {
        await parser.destroy();
    }
}

function reportError(res, error, operation) {
    console.error(`${operation} failed:`, error.message);

    return res.status(500).json({
        message: "Unable to complete the requested operation.",
    });
}

async function createInterviewReport(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body;

        if (!req.file) {
            return res.status(400).json({
                message: "Upload a resume in PDF format.",
            });
        }

        if (req.file.mimetype !== "application/pdf") {
            return res.status(400).json({
                message: "Only PDF resumes are supported.",
            });
        }

        if (req.file.size > MAX_RESUME_SIZE) {
            return res.status(413).json({
                message: "The resume must be no larger than 5 MB.",
            });
        }

        if (
            typeof selfDescription !== "string" ||
            typeof jobDescription !== "string" ||
            !selfDescription.trim() ||
            !jobDescription.trim()
        ) {
            return res.status(400).json({
                message: "Candidate background and job description are required.",
            });
        }

        const resumeText = await extractResumeText(req.file.buffer);

        if (!resumeText) {
            return res.status(422).json({
                message: "No readable text was found in the PDF.",
            });
        }

        if (resumeText.length > MAX_EXTRACTED_TEXT_LENGTH) {
            return res.status(413).json({
                message: "The extracted resume text is too long.",
            });
        }

        const assessment = await generateInterviewReport({
            resume: resumeText,
            selfDescription: selfDescription.trim(),
            jobDescription: jobDescription.trim(),
        });

        if (!assessment || typeof assessment !== "object") {
            throw new Error("The AI service returned an invalid report.");
        }

        const report = await InterviewReport.create({
            ownerId: req.user.id,
            resumeText,
            candidateSummary: selfDescription.trim(),
            roleDescription: jobDescription.trim(),
            assessment,
        });

        return res.status(201).json({
            message: "Interview report created successfully.",
            report,
        });
    } catch (error) {
        return reportError(res, error, "Interview report generation");
    }
}

async function getInterviewReport(req, res) {
    try {
        const { reportId } = req.params;

        if (!mongoose.isValidObjectId(reportId)) {
            return res.status(400).json({
                message: "Invalid report identifier.",
            });
        }

        const report = await InterviewReport.findOne({
            _id: reportId,
            ownerId: req.user.id,
        }).select("-resumeText");

        if (!report) {
            return res.status(404).json({
                message: "Interview report not found.",
            });
        }

        return res.status(200).json({ report });
    } catch (error) {
        return reportError(res, error, "Interview report lookup");
    }
}

async function listInterviewReports(req, res) {
    try {
        const reports = await InterviewReport.find({
            ownerId: req.user.id,
        })
            .select("-resumeText -candidateSummary -roleDescription -__v")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            count: reports.length,
            reports,
        });
    } catch (error) {
        return reportError(res, error, "Interview report listing");
    }
}

async function downloadResumePdf(req, res) {
    try {
        const { reportId } = req.params;

        if (!mongoose.isValidObjectId(reportId)) {
            return res.status(400).json({
                message: "Invalid report identifier.",
            });
        }

        const report = await InterviewReport.findOne({
            _id: reportId,
            ownerId: req.user.id,
        });

        if (!report) {
            return res.status(404).json({
                message: "Interview report not found.",
            });
        }

        const pdfBuffer = await generateResumePdf({
            resume: report.resumeText,
            selfDescription: report.candidateSummary,
            jobDescription: report.roleDescription,
            assessment: report.assessment,
        });

        if (!Buffer.isBuffer(pdfBuffer)) {
            throw new Error("The PDF service did not return a valid buffer.");
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="interview-report-${report._id}.pdf"`
        );

        return res.status(200).send(pdfBuffer);
    } catch (error) {
        return reportError(res, error, "PDF generation");
    }
}

module.exports = {
    createInterviewReport,
    getInterviewReport,
    listInterviewReports,
    downloadResumePdf,
};