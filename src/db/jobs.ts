import { Database } from "bun:sqlite";
import { join } from "path";
import { homedir } from "os";
import { mkdirSync, existsSync } from "fs";

export type JobStatus = 'new' | 'seen' | 'applied' | 'saved' | 'rejected';

export interface JobRecord {
  id: string;
  title: string;
  company: string;
  applyUrl: string;
  source: string;
  firstSeen: string;
  lastSeen: string;
  status: JobStatus;
  matchScore: number;
  isHighMatch: boolean;
}

const DB_DIR = join(homedir(), '.job-finder');
const DB_PATH = join(DB_DIR, 'jobs.db');

const CREATE_TABLES = `
CREATE TABLE IF NOT EXISTS job_records (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  applyUrl TEXT NOT NULL,
  source TEXT NOT NULL,
  firstSeen TEXT NOT NULL,
  lastSeen TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  matchScore INTEGER DEFAULT 0,
  isHighMatch BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_status ON job_records(status);
CREATE INDEX IF NOT EXISTS idx_source ON job_records(source);
CREATE INDEX IF NOT EXISTS idx_lastSeen ON job_records(lastSeen);
`;

let _db: Database | null = null;

export function getDb(): Database {
  if (_db) return _db;

  if (!existsSync(DB_DIR)) {
    mkdirSync(DB_DIR, { recursive: true });
  }

  _db = new Database(DB_PATH, { create: true });
  _db.exec("PRAGMA journal_mode = WAL;");
  _db.exec(CREATE_TABLES);

  return _db;
}

export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}

/**
 * Check if a job already exists in the database by its dedup key.
 * Returns the existing record if found, null otherwise.
 */
export function findJob(dedupKey: string): JobRecord | null {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM job_records WHERE id = ?");
  return stmt.get(dedupKey) as JobRecord | null;
}

/**
 * Insert a new job record or update the lastSeen timestamp if it already exists.
 */
export function upsertJob(record: JobRecord): void {
  const db = getDb();
  const now = new Date().toISOString();

  const existing = findJob(record.id);
  if (existing) {
    const stmt = db.prepare(
      "UPDATE job_records SET lastSeen = ?, matchScore = ?, isHighMatch = ? WHERE id = ?"
    );
    stmt.run(now, record.matchScore, record.isHighMatch ? 1 : 0, record.id);
  } else {
    const stmt = db.prepare(
      "INSERT INTO job_records (id, title, company, applyUrl, source, firstSeen, lastSeen, status, matchScore, isHighMatch) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    stmt.run(
      record.id,
      record.title,
      record.company,
      record.applyUrl,
      record.source,
      now,
      now,
      record.status,
      record.matchScore,
      record.isHighMatch ? 1 : 0
    );
  }
}

/**
 * Batch insert/update job records in a single transaction.
 */
export function upsertJobs(records: JobRecord[]): void {
  const db = getDb();
  db.transaction(() => {
    for (const record of records) {
      upsertJob(record);
    }
  })();
}

/**
 * Update the status of a job by its dedup key.
 */
export function updateJobStatus(dedupKey: string, status: JobStatus): void {
  const db = getDb();
  const stmt = db.prepare("UPDATE job_records SET status = ? WHERE id = ?");
  stmt.run(status, dedupKey);
}

/**
 * Get job statistics.
 */
export function getStats(): Record<string, number> {
  const db = getDb();
  const stmt = db.prepare("SELECT status, COUNT(*) as count FROM job_records GROUP BY status");
  const rows = stmt.all() as { status: string; count: number }[];

  const stats: Record<string, number> = { total: 0 };
  for (const row of rows) {
    stats[row.status] = row.count;
    stats.total += row.count;
  }
  return stats;
}

/**
 * Query job history with optional filters.
 */
export function queryHistory(options?: {
  status?: JobStatus;
  source?: string;
  limit?: number;
  offset?: number;
}): JobRecord[] {
  const db = getDb();
  let sql = "SELECT * FROM job_records WHERE 1=1";
  const params: any[] = [];

  if (options?.status) {
    sql += " AND status = ?";
    params.push(options.status);
  }
  if (options?.source) {
    sql += " AND source = ?";
    params.push(options.source);
  }

  sql += " ORDER BY lastSeen DESC";
  if (options?.limit) {
    sql += " LIMIT ?";
    params.push(options.limit);
  }
  if (options?.offset) {
    sql += " OFFSET ?";
    params.push(options.offset);
  }

  const stmt = db.prepare(sql);
  return stmt.all(...params) as JobRecord[];
}
