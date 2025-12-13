import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('Running shipment updates migration...');
        const sqlPath = path.join(__dirname, 'migration-add-shipment-fields-and-updates.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.query(sql);
        console.log('Shipment updates migration completed successfully.');
    } catch (err) {
        console.error('Error running migration:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
