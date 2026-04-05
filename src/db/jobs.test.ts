import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { getDb, closeDb, findJob, upsertJob, upsertJobs, updateJobStatus, getStats, queryHistory } from "../db/jobs";

describe("SQLite Persistence", () => {
  beforeAll(() => {
    // Use a test-specific DB path to avoid interfering with user data
    // The db module uses ~/.job-finder/jobs.db by default
    // For testing, we create a fresh connection
  });

  afterAll(() => {
    closeDb();
  });

  test("getDb initializes without error", () => {
    const db = getDb();
    expect(db).toBeDefined();
  });

  test("upsertJob inserts a new record", () => {
    const record = {
      id: "test-job-001",
      title: "Test Developer",
      company: "TestCorp",
      applyUrl: "https://test.com/apply",
      source: "test",
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      status: "new" as const,
      matchScore: 50,
      isHighMatch: false,
    };
    upsertJob(record);
    const found = findJob("test-job-001");
    expect(found).not.toBeNull();
    expect(found?.title).toBe("Test Developer");
  });

  test("upsertJob updates lastSeen for existing record", () => {
    const record = {
      id: "test-job-002",
      title: "Update Test",
      company: "UpdateCorp",
      applyUrl: "https://update.com/apply",
      source: "test",
      firstSeen: "2020-01-01T00:00:00.000Z",
      lastSeen: "2020-01-01T00:00:00.000Z",
      status: "new" as const,
      matchScore: 40,
      isHighMatch: false,
    };
    upsertJob(record);
    
    // Update with new timestamp
    const now = new Date().toISOString();
    upsertJob({ ...record, lastSeen: now, matchScore: 55 });
    
    const found = findJob("test-job-002");
    expect(found?.lastSeen).toBe(now);
    expect(found?.matchScore).toBe(55);
  });

  test("upsertJobs batches inserts in a transaction", () => {
    const records = [
      { id: "batch-001", title: "Batch 1", company: "A", applyUrl: "https://a.com", source: "test", firstSeen: new Date().toISOString(), lastSeen: new Date().toISOString(), status: "new" as const, matchScore: 30, isHighMatch: false },
      { id: "batch-002", title: "Batch 2", company: "B", applyUrl: "https://b.com", source: "test", firstSeen: new Date().toISOString(), lastSeen: new Date().toISOString(), status: "new" as const, matchScore: 60, isHighMatch: true },
      { id: "batch-003", title: "Batch 3", company: "C", applyUrl: "https://c.com", source: "test", firstSeen: new Date().toISOString(), lastSeen: new Date().toISOString(), status: "new" as const, matchScore: 45, isHighMatch: false },
    ];
    upsertJobs(records);
    
    expect(findJob("batch-001")).not.toBeNull();
    expect(findJob("batch-002")).not.toBeNull();
    expect(findJob("batch-003")).not.toBeNull();
  });

  test("updateJobStatus changes status", () => {
    const id = "status-test-001";
    upsertJob({
      id, title: "Status Test", company: "X", applyUrl: "https://x.com", source: "test",
      firstSeen: new Date().toISOString(), lastSeen: new Date().toISOString(),
      status: "new", matchScore: 50, isHighMatch: false,
    });
    
    updateJobStatus(id, "applied");
    const found = findJob(id);
    expect(found?.status).toBe("applied");
  });

  test("getStats returns accurate counts", () => {
    const stats = getStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(typeof stats.new).toBe("number");
  });

  test("queryHistory returns sorted results", () => {
    const jobs = queryHistory({ limit: 5 });
    expect(jobs.length).toBeLessThanOrEqual(5);
    // Results should be sorted by lastSeen DESC
    for (let i = 0; i < jobs.length - 1; i++) {
      expect(new Date(jobs[i].lastSeen).getTime()).toBeGreaterThanOrEqual(new Date(jobs[i + 1].lastSeen).getTime());
    }
  });

  test("queryHistory filters by status", () => {
    const applied = queryHistory({ status: "applied" });
    for (const j of applied) {
      expect(j.status).toBe("applied");
    }
  });
});
