// ============================================================
// BrandForge AI — API: Single project
// GET  /api/projects/[id]
// PATCH /api/projects/[id]
// DELETE /api/projects/[id]
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { getProject, updateProject, deleteProject } from '@/lib/store';
import type { Project, ApiResponse, StageKey } from '@/lib/types';

function extractId(req: NextRequest): string {
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  return parts[parts.length - 1];
}

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const id = extractId(req);
    const project = await getProject(id);
    if (!project) return NextResponse.json({ ok: false, error: 'Project not found' }, { status: 404 });
    return NextResponse.json({ ok: true, data: project });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Failed to get project' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const id = extractId(req);
    const body = await req.json().catch(() => ({}));
    const patch = { ...body } as Partial<Project>;
    // Only allow safe fields to be patched via this endpoint
    const allowed: (keyof Project)[] = ['name', 'activeStage', 'discoverySession'];
    const safePatch: Partial<Project> = {};
    for (const k of allowed) if (k in patch) (safePatch as Record<string, unknown>)[k] = (patch as Record<string, unknown>)[k];
    const project = await updateProject(id, safePatch);
    if (!project) return NextResponse.json({ ok: false, error: 'Project not found' }, { status: 404 });
    return NextResponse.json({ ok: true, data: project });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
  try {
    const id = extractId(req);
    const ok = await deleteProject(id);
    if (!ok) return NextResponse.json({ ok: false, error: 'Project not found' }, { status: 404 });
    return NextResponse.json({ ok: true, data: { deleted: true } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Failed to delete project' }, { status: 500 });
  }
}