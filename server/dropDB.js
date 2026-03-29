const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    try {
        const c = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });
        await c.query('DROP DATABASE IF EXISTS ats_resume_db');
        console.log('Database dropped successfully');
        await c.end();
    } catch (e) {
        console.error(e);
    }
}
run();
