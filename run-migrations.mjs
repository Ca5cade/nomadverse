import { Pool } from 'pg';
import fs from 'fs/promises';
import 'dotenv/config';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Make sure your .env file is correct.');
    process.exit(1);
  }

  console.log('Connecting to the database...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    console.log('Successfully connected.');

    console.log('Reading migration file...');
    const sql = await fs.readFile('./migrations/0003_create_initial_tables.sql', 'utf-8');

    console.log('Executing initial table migration...');
    await client.query(sql);
    console.log('Initial tables created successfully!');

    console.log('Reading user progress migration file...');
    const userProgressSql = await fs.readFile('./migrations/0004_add_user_progress_fields.sql', 'utf-8');

    console.log('Executing user progress migration...');
    await client.query(userProgressSql);
    console.log('Successfully applied user progress migration!');

    client.release();
  } catch (err) {
    console.error('Failed to apply migrations:', err);
  } finally {
    await pool.end();
    console.log('Database connection closed.');
  }
}

main();
