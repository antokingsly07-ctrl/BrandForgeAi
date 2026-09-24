// ============================================================
// BrandForge AI — API: AI stage generation
// POST /api/ai/[stage]  -> run a single agent stage
// body: { projectId, extra?: { answers?, seed? } }
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { getProject, saveStage, setActiveStage, updateDiscoverySession } from '@/lib/store';
import { generateStage, getAIMode } from '@/lib/ai/service';
import type { ApiResponse, StageKey, Project } from '@/lib/types';
import { STAGE_ORDER } from '@/lib/types';

// Allow long generations on plans that support it (Pro: up to 300s).
// Hobby caps functions at 60s regardless — the max_tokens cap in the AI
// client keeps typical stages well under that.
export const maxDuration = 300;

function extractStage(req: NextRequest): StageKey {
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  const stage = parts[parts.length - 1];
  if (STAGE_ORDER.includes(stage as StageKey)) return stage as StageKey;
  return 'discovery';
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const stage = extractStage(req);
    const body = await req.json().catch(() => ({}));
    const projectId = String(body?.projectId ?? '').trim();
    const extra = body?.extra ?? {};

    if (!projectId) {
      return NextResponse.json({ ok: false, error: 'projectId is required' }, { status: 400 });
    }

    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ ok: false, error: 'Project not found' }, { status: 404 });
    }

    // Run the stage
    const result = await generateStage({ project, stage, extra });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    // Discovery's "needsClarification" response does NOT save a Discovery object.
    // Instead, persist the follow-up questions into discoverySession and keep the stage empty.
    if (stage === "discovery") {
      const d = result.data as { needsClarification?: boolean; questions?: unknown[]; discovery?: unknown };
      if (d?.needsClarification) {
        await updateDiscoverySession(projectId, {
          questions: (d.questions as import("@/lib/types").FollowUpQuestion[]) ?? [],
          answers: (extra?.answers as Record<string, string>) ?? project.discoverySession.answers ?? {},
          askedAt: new Date().toISOString(),
        });
        // Also persist insight even though stage data is not set
        const { saveStage: _save } = await import("@/lib/store");
        // Store insight on a no-op save so it is visible in the UI
        const existing = await getProject(projectId);
        if (existing && result.insight) {
          existing.insights.discovery = result.insight;
          const { updateProject } = await import("@/lib/store");
          await updateProject(projectId, { insights: existing.insights } as Partial<import("@/lib/types").Project>);
        }
        return NextResponse.json({
          ok: true,
          data: { stageResult: result.data, insight: result.insight, mode: getAIMode(), needsClarification: true },
        });
      }
      // Successful discovery — clear any prior questions and save the discovery
      await updateDiscoverySession(projectId, { questions: [], answers: extra?.answers ?? {}, askedAt: null });
    }

    // Persist stage result + insight
    await saveStage(projectId, stage, (result.data as Record<string, unknown>).discovery ?? result.data, result.insight);

    // Auto-advance activeStage if this was the current stage
    const orderIdx = STAGE_ORDER.indexOf(project.activeStage);
    const thisIdx = STAGE_ORDER.indexOf(stage);
    if (thisIdx === orderIdx && thisIdx + 1 < STAGE_ORDER.length) {
      await setActiveStage(projectId, STAGE_ORDER[thisIdx + 1]);
    }

    return NextResponse.json({ ok: true, data: { stageResult: result.data, insight: result.insight, mode: getAIMode() } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'AI stage generation failed';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}