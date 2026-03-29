import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import pool from "../db";
import { chat } from "../gemini";

const router = Router();

// ── POST /api/chat ─────────────────────────────────────────────────────
router.post("/chat", async (req: Request, res: Response): Promise<void> => {
    try {
        const { message, resume_id, user_id } = req.body;
        const userId = user_id || "anonymous";

        if (!message) {
            res.status(400).json({ error: "message is required" });
            return;
        }

        // Get resume data if resume_id provided
        let resumeData = null;
        if (resume_id) {
            const [rows] = await pool.execute("SELECT * FROM resumes WHERE id = ?", [resume_id]);
            const resumes = rows as any[];
            if (resumes.length > 0) {
                resumeData = typeof resumes[0].parsed_data === "string"
                    ? JSON.parse(resumes[0].parsed_data)
                    : resumes[0].parsed_data;
            }
        }

        // Get chat history
        const [historyRows] = await pool.execute(
            "SELECT role, message FROM chat_history WHERE user_id = ? AND (resume_id = ? OR resume_id IS NULL) ORDER BY created_at DESC LIMIT 20",
            [userId, resume_id || null]
        );
        const chatHistory = (historyRows as any[]).reverse();

        // Get AI response
        const aiResponse = await chat(message, resumeData, chatHistory);

        // Store user message
        await pool.execute(
            "INSERT INTO chat_history (id, user_id, resume_id, role, message) VALUES (?, ?, ?, ?, ?)",
            [uuidv4(), userId, resume_id || null, "user", message]
        );

        // Store AI response
        await pool.execute(
            "INSERT INTO chat_history (id, user_id, resume_id, role, message) VALUES (?, ?, ?, ?, ?)",
            [uuidv4(), userId, resume_id || null, "assistant", aiResponse]
        );

        res.json({
            success: true,
            data: {
                role: "assistant",
                message: aiResponse,
            },
        });
    } catch (error: any) {
        console.error("Chat error:", error);
        res.status(500).json({ error: error.message || "Failed to get chat response" });
    }
});

// ── GET /api/chat-history ──────────────────────────────────────────────
router.get("/chat-history", async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req.query.user_id as string) || "anonymous";
        const resumeId = req.query.resume_id as string;

        const [rows] = await pool.execute(
            "SELECT role, message, created_at FROM chat_history WHERE user_id = ? AND (resume_id = ? OR resume_id IS NULL) ORDER BY created_at ASC LIMIT 100",
            [userId, resumeId || null]
        );

        res.json({ success: true, data: rows });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
