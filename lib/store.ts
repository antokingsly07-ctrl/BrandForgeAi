// ============================================================
// BrandForge AI — persistence store (Redis-backed with file fallback)
//
// Vercel serverless functions have NO shared filesystem: each instance
// has its own memory and its own /tmp. The old file-only store meant a
// project created on instance A was invisible to instance B, producing
// "Project not found" on the very next API call in production.
//
// Backend selection:
//   1. Upstash Redis (shared) when REST credentials are set — required
//      for correct behavior on Vercel.
//   2. Local JSON file otherwise (./data, or /tmp/brandforge-data on
//      Vercel without Redis) — fine for local dev, ephemeral in prod.
//
// A write-queue serializes writes within an instance so concurrent API
// calls never corrupt the file backend.
// ============================================================
import { promises as fs } from 'fs';
import path from 'path';
import { makeId, titleFromIdea } from './utils';
import type { Project, ProjectStages, StageInsight, StageKey } from './types';
import { buildDemoProject } from './demoProject';

interface DBShape {
  projects: Project[];
}

// Backend selection:
//   1. Upstash Redis (shared) when REST credentials are set — required for
//      correct behavior on Vercel. The Upstash Redis Vercel integration
//      auto-adds KV_REST_API_URL + KV_REST_API_TOKEN (legacy names kept
//      for compatibility); UPSTASH_REDIS_REST_URL/TOKEN also work.
//   2. Local JSON file otherwise (./data, or /tmp/brandforge-data on
//      Vercel without Redis) — fine for local dev, ephemeral in prod.
const KV_KEY = 'brandforge:db:v1';

function redisCredentials(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
  if (url && token) return { url, token };
  return null;
}

function useRedis(): boolean {
  return redisCredentials() !== null;
}

async function redisGetDb(): Promise<DBShape> {
  const creds = redisCredentials()!;
  const { Redis } = await import('@upstash/redis');
  const redis = new Redis({ url: creds.url, token: creds.token });
  const data = await redis.get<DBShape>(KV_KEY);
  if (data && Array.isArray(data.projects)) return data;
  return { projects: [] };
}

async function redisSetDb(db: DBShape): Promise<void> {
  const creds = redisCredentials()!;
  const { Redis } = await import('@upstash/redis');
  const redis = new Redis({ url: creds.url, token: creds.token });
  await redis.set(KV_KEY, db);
}

// ------------------------------------------------------------
// File backend (local dev / Vercel-without-KV fallback)
// ------------------------------------------------------------
// Vercel's serverless filesystem is read-only except /tmp, so writing to
// ./data fails in production with EROFS. Use /tmp on Vercel unless
// DATA_DIR is set explicitly. Note: /tmp is ephemeral per instance.
function resolveDataDir(): string {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  if (process.env.VERCEL) return '/tmp/brandforge-data';
  return path.join(process.cwd(), 'data');
}

const DATA_DIR = resolveDataDir();
const DB_FILE = path.join(DATA_DIR, 'db.json');

let dbCache: DBShape | null = null;
let writeChain: Promise<unknown> = Promise.resolve();

function emptyStages(): ProjectStages {
  return {
    discovery: null,
    positioning: null,
    personality: null,
    naming: null,
    messaging: null,
    visual: null,
    critique: null,
    consistency: null,
    launch: null,
  };
}

function makeProject(name: string, idea: string, opts: { isDemo?: boolean } = {}): Project {
  const now = new Date().toISOString();
  return {
    id: makeId('prj'),
    name: name || titleFromIdea(idea) || 'Untitled brand',
    idea: idea || '',
    createdAt: now,
    updatedAt: now,
    isDemo: Boolean(opts.isDemo),
    activeStage: 'discovery',
    insights: {},
    discoverySession: { questions: [], answers: {}, askedAt: null },
    stages: emptyStages(),
  };
}

async function fileEnsureDb(): Promise<void> {
  if (dbCache) return;
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as DBShape;
    dbCache = {
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    };
  } catch {
    dbCache = { projects: [] };
    await filePersist(dbCache);
  }
}

async function filePersist(db: DBShape): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

// ------------------------------------------------------------
// Backend-agnostic load/save
// ------------------------------------------------------------
async function loadDb(): Promise<DBShape> {
  if (useRedis()) return redisGetDb();
  await fileEnsureDb();
  return dbCache!;
}

async function saveDb(db: DBShape): Promise<void> {
  if (useRedis()) {
    await redisSetDb(db);
    return;
  }
  writeChain = writeChain.then(() => filePersist(db)).catch(() => undefined);
  return writeChain as Promise<void>;
}

// ------------------------------------------------------------
// Public API
// ------------------------------------------------------------
export async function listProjects(): Promise<Project[]> {
  const db = await loadDb();
  return [...db.projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getProject(id: string): Promise<Project | null> {
  const db = await loadDb();
  return db.projects.find((p) => p.id === id) ?? null;
}

export interface CreateProjectInput {
  name?: string;
  idea: string;
  demo?: boolean;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const db = await loadDb();
  const project =
    input.demo === true
      ? buildDemoProject()
      : makeProject((input.name || '').trim(), (input.idea || '').trim());
  db.projects.push(project);
  await saveDb(db);
  return project;
}

export async function updateProject(id: string, patch: Partial<Project>): Promise<Project | null> {
  const db = await loadDb();
  const idx = db.projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const existing = db.projects[idx];
  db.projects[idx] = {
    ...existing,
    ...patch,
    id: existing.id,
    updatedAt: new Date().toISOString(),
  };
  await saveDb(db);
  return db.projects[idx];
}

export async function saveStage(
  id: string,
  stage: StageKey,
  value: unknown,
  insight?: StageInsight,
): Promise<Project | null> {
  const db = await loadDb();
  const idx = db.projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const existing = db.projects[idx];
  const stages = { ...existing.stages } as ProjectStages;
  (stages as unknown as Record<string, unknown>)[stage] = value;
  const insights = insight ? { ...existing.insights, [stage]: insight } : existing.insights;
  db.projects[idx] = {
    ...existing,
    stages,
    insights,
    updatedAt: new Date().toISOString(),
  };
  await saveDb(db);
  return db.projects[idx];
}

export async function setActiveStage(id: string, stage: StageKey): Promise<Project | null> {
  return updateProject(id, { activeStage: stage });
}

export async function deleteProject(id: string): Promise<boolean> {
  const db = await loadDb();
  const before = db.projects.length;
  db.projects = db.projects.filter((p) => p.id !== id);
  if (db.projects.length === before) return false;
  await saveDb(db);
  return true;
}

export async function updateDiscoverySession(
  id: string,
  session: Project['discoverySession'],
): Promise<Project | null> {
  return updateProject(id, { discoverySession: session } as Partial<Project>);
}

/** Which storage backend is active — exposed for diagnostics. */
export function storageBackend(): 'upstash-redis' | 'file' {
  return useRedis() ? 'upstash-redis' : 'file';
}
