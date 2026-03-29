import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import pool from "../db";
import { matchJob } from "../gemini";

const router = Router();

// ── POST /api/job-match ────────────────────────────────────────────────
router.post("/job-match", async (req: Request, res: Response): Promise<void> => {
    try {
        const { resume_id, job_description, job_title } = req.body;

        if (!resume_id || !job_description) {
            res.status(400).json({ error: "resume_id and job_description are required" });
            return;
        }

        // Get resume data
        const [rows] = await pool.execute("SELECT * FROM resumes WHERE id = ?", [resume_id]);
        const resumes = rows as any[];

        if (resumes.length === 0) {
            res.status(404).json({ error: "Resume not found" });
            return;
        }

        const resume = resumes[0];
        const parsedData = typeof resume.parsed_data === "string"
            ? JSON.parse(resume.parsed_data)
            : resume.parsed_data;

        // Match with Gemini AI
        const matchResult = await matchJob(parsedData, job_description);

        // Store in database
        const matchId = uuidv4();
        await pool.execute(
            `INSERT INTO job_matches (id, resume_id, job_description, job_title, match_score, matched_keywords, missing_keywords, analysis_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                matchId,
                resume_id,
                job_description,
                job_title || null,
                matchResult.match_score,
                JSON.stringify(matchResult.matched_keywords),
                JSON.stringify(matchResult.missing_keywords),
                JSON.stringify(matchResult.analysis),
            ]
        );

        res.json({
            success: true,
            data: {
                match_id: matchId,
                ...matchResult,
            },
        });
    } catch (error: any) {
        console.error("Job match error:", error);
        res.status(500).json({ error: error.message || "Failed to match job" });
    }
});

// ── GET /api/job-matches/:resume_id ────────────────────────────────────
router.get("/job-matches/:resume_id", async (req: Request, res: Response): Promise<void> => {
    try {
        const { resume_id } = req.params;
        const [rows] = await pool.execute(
            "SELECT * FROM job_matches WHERE resume_id = ? ORDER BY created_at DESC",
            [resume_id]
        );
        res.json({ success: true, data: rows });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ── GET /api/jobs/search ──────────────────────────────────────────────
router.get("/jobs/search", async (req: Request, res: Response): Promise<void> => {
    try {
        const { role, platform } = req.query;
        if (!role) {
            res.status(400).json({ error: "role is required" });
            return;
        }

        const rapidApiKey = process.env.RAPIDAPI_KEY;

        if (rapidApiKey) {
            // Integration with JSearch API if key is available
            const query = `${role} in ${platform || "India"}`;
            const response = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&num_pages=1`, {
                headers: {
                    "X-RapidAPI-Key": rapidApiKey,
                    "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
                }
            });
            const data = await response.json() as any;
            if (data.data) {
                const formatted = data.data.map((job: any) => ({
                    id: job.job_id,
                    title: job.job_title,
                    company: job.employer_name,
                    location: job.job_city ? `${job.job_city}, ${job.job_country}` : (job.job_country || "Remote"),
                    platform: platform || (job.job_publisher?.toLowerCase().includes("linkedin") ? "LinkedIn" : "General"),
                    url: job.job_apply_link,
                    description: job.job_description,
                    posted_at: job.job_posted_at_datetime_utc
                }));
                res.json({ success: true, data: formatted });
                return;
            }
        }

        // Mock data fallback if no API key is provided
        const platformName = platform === "naukri" ? "Naukri" : "LinkedIn";
        const dummyJobs = [
            {
                id: uuidv4(),
                title: `${role} - Senior Level`,
                company: "TechNova Solutions",
                location: "Remote, India",
                platform: platformName,
                url: "#",
                description: `We are looking for an experienced ${role} to join our growing team. You will be responsible for leading development efforts and collaborating cross-functionally. Requirements include 5+ years of experience and strong problem-solving skills in the required domain. Strong communication skills are a must.`,
                posted_at: new Date().toISOString()
            },
            {
                id: uuidv4(),
                title: `Lead ${role}`,
                company: "Global Innovations Inc",
                location: "Bengaluru, Karnataka",
                platform: platformName,
                url: "#",
                description: `Global Innovations is seeking a Lead ${role}. Provide technical guidance, architect enterprise solutions, and mentor junior developers. Minimum 7 years experience. Great benefits and remote flexibility.`,
                posted_at: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: uuidv4(),
                title: `${role} Specialist`,
                company: "Finserve Dynamics",
                location: "Mumbai, Maharashtra",
                platform: platformName,
                url: "#",
                description: `Join Finserve Dynamics as a ${role} Specialist. You will work on high-availability fintech products ensuring robust security and performance. Degree in Computer Science or related field required. Familiarity with agile methodologies.`,
                posted_at: new Date(Date.now() - 172800000).toISOString()
            }
        ];

        // Simulate network delay
        setTimeout(() => {
            res.json({ success: true, data: dummyJobs });
        }, 1200);

    } catch (error: any) {
        console.error("Job search error:", error);
        res.status(500).json({ error: error.message || "Failed to search jobs" });
    }
});

export default router;
