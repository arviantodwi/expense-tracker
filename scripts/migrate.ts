/**
 * Apply initial migration to create Accounts and Expenses tables
 */

import 'dotenv/config';
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const DATABASE_URL = process.env.DATABASE_URL!.replace('file:', '');
const MIGRATION_FILE = join(process.cwd(), 'drizzle', '0001_initial.sql');

async function migrate() {
  try {
    console.log('Starting migration...');

    // Create database connection
    const sqlite = new Database(DATABASE_URL);

    // Read migration SQL
    const migrationSQL = readFileSync(MIGRATION_FILE, 'utf-8');

    // Execute migration
    const statements = migrationSQL
      .split(';')
      .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));

    for (const statement of statements) {
      try {
        sqlite.exec(statement);
        console.log(`Executed: ${statement.substring(0, 50)}...`);
      } catch (error) {
        console.error('Error executing statement:', error);
        console.error('Statement:', statement);
        throw error;
      }
    }

    // Verify tables exist
    const tables = sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('accounts', 'expenses')"
      )
      .all();

    console.log('Tables created:', tables.map((t: any) => t.name));

    sqlite.close();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
