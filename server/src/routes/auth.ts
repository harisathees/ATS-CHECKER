import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from "google-auth-library";
import pool from "../db";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-123";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register with Email/Password
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if ((existing as any[]).length > 0) {
            return res.status(400).json({ success: false, error: "Email already exists" });
        }

        const id = uuidv4();
        const passwordHash = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
            [id, name, email, passwordHash]
        );

        const token = jwt.sign({ id, email, name }, JWT_SECRET, { expiresIn: "7d" });
        res.json({ success: true, token, user: { id, name, email } });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, error: "Failed to register" });
    }
});

// Login with Email/Password
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        const user = (users as any[])[0];

        if (!user || !user.password_hash) {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
        res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, error: "Failed to login" });
    }
});

// Google Authentication
router.post("/google", async (req, res) => {
    try {
        const { credential } = req.body;

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            return res.status(400).json({ success: false, error: "Invalid Google token" });
        }

        const { email, name, sub: google_id } = payload;

        // Check if user exists by google_id or email
        let [users] = await pool.query("SELECT * FROM users WHERE google_id = ? OR email = ?", [google_id, email]);
        let user = (users as any[])[0];

        if (!user) {
            // Create a new user
            const id = uuidv4();
            await pool.query(
                "INSERT INTO users (id, name, email, google_id) VALUES (?, ?, ?, ?)",
                [id, name, email, google_id]
            );
            user = { id, name, email };
        } else if (!user.google_id) {
            // Link google account to existing email
            await pool.query("UPDATE users SET google_id = ? WHERE id = ?", [google_id, user.id]);
        }

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
        res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ success: false, error: "Google Authentication failed" });
    }
});

export default router;
