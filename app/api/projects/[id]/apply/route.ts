// POST /api/projects/[id]/apply
// body: { kind: "critique"|"consistency", id: string, action: "accept"|"reject"|"applied", target?: { stage, path, value } }
import { NextRequest, NextResponse } from "next/server";
import { getProject, updateProject } from "@/lib/store";
import { setDeep } from "@/lib/utils";
import type { ApiResponse } from "@/lib/types";
import { validateStage } from "@/lib/ai/validate";

function extractId(req: NextRequest): string {
  const parts = new URL(req.url).pathname.split("/");
  // /api/projects/[id]/apply -> id is third last segment
  // pathname: /api/projects/prj_xxx/apply
  const idx = parts.indexOf("projects");
  return parts[idx + 1] ?? "";
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const id = extractId(req);
    const body = await req.json().catch(() => ({}));
    const kind: "critique" | "consistency" = body.kind === "consistency" ? "consistency" : "critique";
    const issueId: string = String(body.id ?? "");
    const action: string = String(body.action ?? "accept");
    const target = body.target as { stage?: string; path?: string; value?: string; label?: string } | undefined;

    if (!id || !issueId) return NextResponse.json({ ok: false, error: "Missing project id or issue id" }, { status: 400 });

    const project = await getProject(id);
    if (!project) return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });

    const stageKey = kind === "critique" ? "critique" : "consistency";
    const report = project.stages[stageKey] as unknown as { issues?: unknown[]; conflicts?: unknown[] } | null;
    if (!report) return NextResponse.json({ ok: false, error: "Report not found" }, { status: 404 });

    const listKey = kind === "critique" ? "issues" : "conflicts";
    const list = (report as Record<string, unknown>)[listKey] as Array<Record<string, unknown>> | undefined;
    if (!Array.isArray(list)) return NextResponse.json({ ok: false, error: "No issues" }, { status: 404 });

    const idx = list.findIndex((x) => x.id === issueId);
    if (idx === -1) return NextResponse.json({ ok: false, error: "Issue not found" }, { status: 404 });

    const allowedActions = new Set(["accept", "reject", "applied", "open"]);
    if (!allowedActions.has(action)) return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
    const nextStatus = action === "reject" ? "rejected" : action === "applied" ? "applied" : action === "accept" ? "accepted" : "open";

    list[idx] = { ...list[idx], status: nextStatus };

    // If action is "applied" and target present, patch the target stage field
    if (nextStatus === "applied" && target?.stage && target?.path && typeof target.value === "string") {
      const targetStage = target.stage as keyof typeof project.stages;
      const current = project.stages[targetStage];
      if (current && typeof current === "object") {
        const next = setDeep(current as unknown as Record<string, unknown>, target.path, target.value);
        try {
          // Validate after patch
          validateStage(target.stage as string, next);
          (project.stages as unknown as Record<string, unknown>)[targetStage] = next;
        } catch (e) {
          return NextResponse.json(
            { ok: false, error: e instanceof Error ? e.message : "Validation failed after apply" },
            { status: 422 }
          );
        }
      }
    }

    await updateProject(id, { stages: project.stages } as Partial<import("@/lib/types").Project>);
    const fresh = await getProject(id);
    return NextResponse.json({ ok: true, data: fresh });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Apply failed" }, { status: 500 });
  }
}
