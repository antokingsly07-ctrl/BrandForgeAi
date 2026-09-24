// ============================================================
// BrandForge AI — API: Project CRUD
// GET  /api/projects           -> list projects
// POST /api/projects           -> create project
// GET  /api/projects/[id]      -> get project
// PATCH /api/projects/[id]     -> update project (name, activeStage, etc)
// DELETE /api/projects/[id]    -> delete project
// POST /api/projects/demo      -> create seeded demo project
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { listProjects, getProject, createProject, updateProject, deleteProject } from '@/lib/store';
import type { Project, ApiResponse } from '@/lib/types';
import { titleFromIdea } from '@/lib/utils';
import { buildDemoProject } from '@/lib/demoProject';

export async function GET(): Promise<NextResponse<ApiResponse<Project[]>>> {
  try {
    const projects = await listProjects();
    return NextResponse.json({ ok: true, data: projects });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Failed to list projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const body = await req.json().catch(() => ({}));
    const idea = String(body?.idea ?? '').trim();
    const name = String(body?.name ?? '').trim();
    const isDemo = body?.demo === true;
    if (!idea && !isDemo) {
      return NextResponse.json({ ok: false, error: 'Idea is required' }, { status: 400 });
    }
    const project = isDemo ? await createProject({ name: "Teampact", idea: "demo", demo: true }) : await createProject({ name: name || titleFromIdea(idea), idea });
    return NextResponse.json({ ok: true, data: project });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Failed to create project' }, { status: 500 });
  }
}