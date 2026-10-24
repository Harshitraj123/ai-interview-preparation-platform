const multer = require("multer");
const path = require("path");

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: MAX_RESUME_SIZE,
        files: 1,
    },

    fileFilter(req, file, callback) {
        const extension = path.extname(file.originalname).toLowerCase();

        if (
            file.mimetype !== "application/pdf" ||
            extension !== ".pdf"
        ) {
            return callback(
                new Error("Only PDF resume files are supported.")
            );
        }

        return callback(null, true);
    },
});

module.exports = upload;