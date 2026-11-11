import '../src/config/env.js'; import { readFile } from 'node:fs/promises';
if (process.argv.includes('--test')) process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing. Copy .env.example to .env and configure it.');
const { pool } = await import('../src/config/db.js');
try { const sql=await readFile(new URL('../migrations/001_init.sql',import.meta.url),'utf8'); await pool.query(sql); process.stdout.write('Database migration complete.\n'); } finally { await pool.end(); }
