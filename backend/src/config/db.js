const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../attendance.db');
const schemaPath = path.join(__dirname, '../../../database/schema.sql');
const seedPath = path.join(__dirname, '../../../database/seed.sql');

// Initialize SQLite DB connection
const db = new Database(dbPath, { verbose: null });

// Enable Foreign Key Constraints
db.pragma('foreign_keys = ON');

function initDb() {
    try {
        // Check if tables already exist
        const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='employees'").get();
        
        if (!tableCheck) {
            console.log('Initializing database schema and seed data...');
            
            if (fs.existsSync(schemaPath)) {
                const schemaSql = fs.readFileSync(schemaPath, 'utf8');
                db.exec(schemaSql);
                console.log('Database schema created successfully.');
            }

            if (fs.existsSync(seedPath)) {
                const seedSql = fs.readFileSync(seedPath, 'utf8');
                db.exec(seedSql);
                console.log('Database seed data inserted successfully.');
            }
        }

    } catch (err) {
        console.error('Database initialization error:', err.message);
    }
}

// Run DB initialization
initDb();

module.exports = db;
