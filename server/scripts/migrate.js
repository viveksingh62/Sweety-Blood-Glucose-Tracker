import 'dotenv/config'; import { readFile } from 'node:fs/promises'; import { pool } from '../src/config/db.js';
try { const sql=await readFile(new URL('../migrations/001_init.sql',import.meta.url),'utf8'); await pool.query(sql); process.stdout.write('Database migration complete.\n'); } finally { await pool.end(); }
