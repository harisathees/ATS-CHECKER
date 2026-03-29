import { Router, Request, Response } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import pool from "../db";
import { parseResume, rewriteResume } from "../gemini";

const router = Router();

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
        const validTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (validTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only PDF, DOC, DOCX allowed."));
        }
    },
});

// ── POST /api/upload-resume ────────────────────────────────────────────
router.post(
    "/upload-resume",
    upload.single("file"),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const file = req.file;
            if (!file) {
                res.status(400).json({ error: "No file provided" });
                return;
            }

            const resumeId = uuidv4();
            const userId = (req.body.user_id as string) || "anonymous";
            const industry = req.body.industry as string | undefined;

            // Read file as base64
            const fileBuffer = fs.readFileSync(file.path);
            const base64Data = fileBuffer.toString("base64");

            // Parse with Gemini AI
            const parsedData = await parseResume(base64Data, file.mimetype, industry);

            if (!parsedData.is_resume) {
                // Clean up uploaded file
                fs.unlinkSync(file.path);
                res.json({
                    success: false,
                    data: parsedData,
                    message: parsedData.message || "Document is not a resume",
                });
                return;
            }

            // Store in database
            await pool.execute(
                `INSERT INTO resumes (id, user_id, file_name, file_url, file_size, file_type, parsed_data, industry)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    resumeId,
                    userId,
                    file.originalname,
                    file.path,
                    file.size,
                    file.mimetype,
                    JSON.stringify(parsedData),
                    parsedData.industry || industry || null,
                ]
            );

            // Store scores
            const scoreId = uuidv4();
            const ats = parsedData.ats_analysis;
            await pool.execute(
                `INSERT INTO scores (id, resume_id, overall_score, formatting_score, keywords_score, impact_score, skills_alignment_score, breakdown_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    scoreId,
                    resumeId,
                    ats?.score || 0,
                    ats?.formatting_score || 0,
                    ats?.keywords_score || 0,
                    ats?.impact_score || 0,
                    ats?.skills_alignment_score || 0,
                    JSON.stringify(ats),
                ]
            );

            // Store suggestions
            if (parsedData.pro_suggestions?.categories) {
                for (const cat of parsedData.pro_suggestions.categories) {
                    for (const suggestion of cat.suggestions) {
                        await pool.execute(
                            `INSERT INTO suggestions (id, resume_id, category, priority, suggestion_text, impact)
               VALUES (?, ?, ?, ?, ?, ?)`,
                            [uuidv4(), resumeId, cat.category, cat.priority, suggestion, cat.impact]
                        );
                    }
                }
            }

            res.json({
                success: true,
                data: {
                    resume_id: resumeId,
                    ...parsedData,
                    scores: {
                        overall_score: ats?.score || 0,
                        formatting: ats?.formatting_score || 0,
                        keywords: ats?.keywords_score || 0,
                        impact: ats?.impact_score || 0,
                        skills_alignment: ats?.skills_alignment_score || 0,
                    },
                },
                message: "Resume processed successfully",
            });
        } catch (error: any) {
            console.error("Upload error:", error);
            res.status(500).json({ error: error.message || "Failed to process resume" });
        }
    }
);

// ── POST /api/analyze-resume ───────────────────────────────────────────
router.post("/analyze-resume", async (req: Request, res: Response): Promise<void> => {
    try {
        const { resume_id } = req.body;
        if (!resume_id) {
            res.status(400).json({ error: "resume_id is required" });
            return;
        }

        const [rows] = await pool.execute(
            "SELECT * FROM resumes WHERE id = ?",
            [resume_id]
        );

        const resumes = rows as any[];
        if (resumes.length === 0) {
            res.status(404).json({ error: "Resume not found" });
            return;
        }

        const resume = resumes[0];
        const parsedData = typeof resume.parsed_data === "string"
            ? JSON.parse(resume.parsed_data)
            : resume.parsed_data;

        // Get scores
        const [scoreRows] = await pool.execute(
            "SELECT * FROM scores WHERE resume_id = ? ORDER BY created_at DESC LIMIT 1",
            [resume_id]
        );

        // Get suggestions
        const [suggestionRows] = await pool.execute(
            "SELECT * FROM suggestions WHERE resume_id = ?",
            [resume_id]
        );

        res.json({
            success: true,
            data: {
                resume_data: parsedData,
                scores: (scoreRows as any[])[0] || null,
                suggestions: suggestionRows,
                industry: resume.industry,
            },
        });
    } catch (error: any) {
        console.error("Analyze error:", error);
        res.status(500).json({ error: error.message || "Failed to analyze resume" });
    }
});

// ── POST /api/generate-score ───────────────────────────────────────────
router.post("/generate-score", async (req: Request, res: Response): Promise<void> => {
    try {
        const { resume_id } = req.body;
        if (!resume_id) {
            res.status(400).json({ error: "resume_id is required" });
            return;
        }

        const [scoreRows] = await pool.execute(
            "SELECT * FROM scores WHERE resume_id = ? ORDER BY created_at DESC LIMIT 1",
            [resume_id]
        );

        const scores = scoreRows as any[];
        if (scores.length === 0) {
            res.status(404).json({ error: "No scores found for this resume" });
            return;
        }

        const score = scores[0];
        res.json({
            success: true,
            scores: {
                overall_score: score.overall_score,
                formatting: score.formatting_score,
                keywords: score.keywords_score,
                impact: score.impact_score,
                skills_alignment: score.skills_alignment_score,
            },
        });
    } catch (error: any) {
        console.error("Score error:", error);
        res.status(500).json({ error: error.message || "Failed to get score" });
    }
});

// ── POST /api/rewrite-resume ───────────────────────────────────────────
router.post("/rewrite-resume", async (req: Request, res: Response): Promise<void> => {
    try {
        const { resume_id, industry } = req.body;
        if (!resume_id) {
            res.status(400).json({ error: "resume_id is required" });
            return;
        }

        const [rows] = await pool.execute(
            "SELECT * FROM resumes WHERE id = ?",
            [resume_id]
        );

        const resumes = rows as any[];
        if (resumes.length === 0) {
            res.status(404).json({ error: "Resume not found" });
            return;
        }

        const resume = resumes[0];
        const parsedData = typeof resume.parsed_data === "string"
            ? JSON.parse(resume.parsed_data)
            : resume.parsed_data;

        const improvedResume = await rewriteResume(parsedData, industry || resume.industry);

        res.json({
            success: true,
            improved_resume: improvedResume,
        });
    } catch (error: any) {
        console.error("Rewrite error:", error);
        res.status(500).json({ error: error.message || "Failed to rewrite resume" });
    }
});

// ── GET /api/resumes/:id ───────────────────────────────────────────────
router.get("/resumes/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const [rows] = await pool.execute("SELECT * FROM resumes WHERE id = ?", [id]);
        const resumes = rows as any[];

        if (resumes.length === 0) {
            res.status(404).json({ error: "Resume not found" });
            return;
        }

        const resume = resumes[0];
        resume.parsed_data = typeof resume.parsed_data === "string"
            ? JSON.parse(resume.parsed_data)
            : resume.parsed_data;

        res.json({ success: true, data: resume });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ── GET /api/resumes (list all) ────────────────────────────────────────
router.get("/resumes", async (_req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await pool.execute(
            "SELECT r.id, r.file_name, r.industry, r.version, r.created_at, s.overall_score FROM resumes r LEFT JOIN scores s ON r.id = s.resume_id ORDER BY r.created_at DESC LIMIT 50"
        );
        res.json({ success: true, data: rows });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
