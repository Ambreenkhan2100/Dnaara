const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const _pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDb() {
  const client = await _pool.connect();
  try {
    console.log('Initializing database...');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('importer', 'agent', 'admin')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created users table.');

    // User Profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        legal_business_name VARCHAR(255),
        trade_registration_number VARCHAR(255),
        national_address TEXT,
        full_name VARCHAR(255),
        position VARCHAR(255),
        phone_number VARCHAR(50),
        national_id VARCHAR(50),
        company_email VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created user_profiles table.');

    // Verification OTPs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_otps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created verification_otps table.');

    console.log('Database initialization completed successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
    await _pool.end();
  }
}

initDb();
