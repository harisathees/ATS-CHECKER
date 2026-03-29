import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./db";
import resumeRoutes from "./routes/resume";
import jobRoutes from "./routes/job";
import chatRoutes from "./routes/chat";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "5000");

// ── Middleware ──────────────────────────────────────────────────────────
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ── Routes ─────────────────────────────────────────────────────────────
app.use("/api", resumeRoutes);
app.use("/api", jobRoutes);
app.use("/api", chatRoutes);
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Start Server ───────────────────────────────────────────────────────
async function start() {
    try {
        await initializeDatabase();
        app.listen(PORT, () => {
            console.log(`\n🚀 ATS Resume Checkerligence Server running on http://localhost:${PORT}`);
            console.log(`📡 API endpoints:`);
            console.log(`   POST /api/upload-resume`);
            console.log(`   POST /api/analyze-resume`);
            console.log(`   POST /api/generate-score`);
            console.log(`   POST /api/rewrite-resume`);
            console.log(`   POST /api/job-match`);
            console.log(`   POST /api/chat`);
            console.log(`   POST /api/auth/register`);
            console.log(`   POST /api/auth/login`);
            console.log(`   POST /api/auth/google`);
            console.log(`   GET  /api/health\n`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}

start();
