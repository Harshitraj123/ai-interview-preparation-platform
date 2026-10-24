require("dotenv").config();

const mongoose = require("mongoose");

const app = require("./src/app");
const connectDatabase = require("./src/config/database");

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
    try {
        await connectDatabase();

        const server = app.listen(PORT, () => {
            console.log("AI Interview Preparation API started.");
            console.log(`Server: http://localhost:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
        });

        server.on("error", (error) => {
            console.error("HTTP server error:", error.message);
            process.exitCode = 1;
        });

        async function shutdown(signal) {
            console.log(`${signal} received. Shutting down gracefully.`);

            server.close(async () => {
                try {
                    await mongoose.disconnect();
                    console.log("Database connection closed.");
                    process.exitCode = 0;
                } catch (error) {
                    console.error("Shutdown error:", error.message);
                    process.exitCode = 1;
                }
            });

            setTimeout(() => {
                console.error("Shutdown timed out.");
                process.exit(1);
            }, 10000).unref();
        }

        process.once("SIGINT", () => shutdown("SIGINT"));
        process.once("SIGTERM", () => shutdown("SIGTERM"));
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exitCode = 1;
    }
}

startServer();