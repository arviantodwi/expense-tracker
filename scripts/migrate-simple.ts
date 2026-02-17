/**
 * Simple migration script using better-sqlite3
 * Run with: node --loader tsx scripts/migrate-simple.js
 */

import 'dotenv/config';
import Database from 'better-sqlite3';

const db = new Database(process.env.DATABASE_URL!.replace('file:', ''));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create accounts table
db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    balance REAL DEFAULT 0 NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
    updated_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
  )
`);

// Create expenses table
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    account_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date INTEGER NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
    updated_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON UPDATE no action ON DELETE no action
  )
`);

// Verify tables
const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('accounts', 'expenses')")
  .all();

console.log('✅ Migration completed successfully!');
console.log('Tables created:', tables.map((t: any) => t.name));

db.close();
