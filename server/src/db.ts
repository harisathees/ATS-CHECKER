import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ats_resume_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
});

export async function initializeDatabase(): Promise<void> {
    // First, create database if it doesn't exist (connect without specifying database)
    const tempConnection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "3306"),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        multipleStatements: true,
    });

    try {
        const schemaPath = path.join(__dirname, "schema.sql");
        const schema = fs.readFileSync(schemaPath, "utf8");
        await tempConnection.query(schema);
        console.log("✅ Database initialized successfully");
    } catch (error: any) {
        if (error.code === "ER_DUP_ENTRY") {
            console.log("✅ Database already initialized");
        } else {
            console.error("❌ Database initialization error:", error.message);
            throw error;
        }
    } finally {
        await tempConnection.end();
    }
}

export default pool;
