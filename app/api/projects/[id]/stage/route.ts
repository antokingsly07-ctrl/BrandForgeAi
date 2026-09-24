// POST /api/projects/[id]/stage  -> save edited stage data
// body: { stage: StageKey, data: unknown }
import { NextRequest, NextResponse } from "next/server";
import { getProject, saveStage } from "@/lib/store";
import { validateStage } from "@/lib/ai/validate";
import type { ApiResponse, StageKey } from "@/lib/types";
import { STAGE_ORDER } from "@/lib/types";

function extractId(req: NextRequest): string {
  const parts = new URL(req.url).pathname.split("/");
  const idx = parts.indexOf("projects");
  return parts[idx + 1] ?? "";
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const id = extractId(req);
    const body = await req.json().catch(() => ({}));
    const stage = String(body.stage ?? "") as StageKey;
    const data = body.data;

    if (!id) return NextResponse.json({ ok: false, error: "Missing project id" }, { status: 400 });
    if (!STAGE_ORDER.includes(stage)) return NextResponse.json({ ok: false, error: "Invalid stage" }, { status: 400 });

    const project = await getProject(id);
    if (!project) return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });

    // Validate
    let validated: unknown;
    try {
      validated = validateStage(stage, data);
    } catch (e) {
      return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Validation failed" }, { status: 422 });
    }

    const updated = await saveStage(id, stage, validated);
    return NextResponse.json({ ok: true, data: updated });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Save failed" }, { status: 500 });
  }
}
