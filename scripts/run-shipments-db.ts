// const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
    const client = await _pool.connect();
    try {
        console.log('Running shipments migration...');
        const sqlPath = path.join(__dirname, 'create-shipments-table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.query(sql);
        console.log('Shipments tables created successfully.');
    } catch (err) {
        console.error('Error running migration:', err);
    } finally {
        client.release();
        await _pool.end();
    }
}

runMigration();
