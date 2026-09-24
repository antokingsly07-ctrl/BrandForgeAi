"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit3,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  Search,
  Target,
  PenTool,
  MessageSquare,
  Palette,
  Gavel,
  Scale,
  Rocket,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useProject } from "@/components/workspace/ProjectContext";
import type { StageKey, Project, Discovery, Positioning, Personality, Naming, Messaging, Visual, Critique, ConsistencyReport, Launch, FollowUpQuestion, CritiqueIssue, ConsistencyConflict } from "@/lib/types";
import { STAGE_ORDER, STAGE_META } from "@/lib/types";

const STAGE_ICON_MAP: Record<StageKey, typeof Search> = {
  discovery: Search,
  positioning: Target,
  personality: Sparkles,
  naming: PenTool,
  messaging: MessageSquare,
  visual: Palette,
  critique: Gavel,
  consistency: Scale,
  launch: Rocket,
};

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function Badge({ children, variant = "neutral" }: { children: React.ReactNode; variant?: "neutral" | "success" | "warning" | "danger" | "primary" }) {
  const cls =
    variant === "success" ? "badge-success" : variant === "warning" ? "badge-warning" : variant === "danger" ? "badge-danger" : variant === "primary" ? "badge-primary" : "badge-neutral";
  return <span className={cls}>{children}</span>;
}

function StageHeader({ stage, subtitle, action }: { stage: StageKey; subtitle?: string; action?: React.ReactNode }) {
  const meta = STAGE_META[stage];
  const Icon = STAGE_ICON_MAP[stage];
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex gap-4">
        <div className="w-11 h-11 rounded-2xl bg-[#8B3DFF] flex items-center justify-center shrink-0" style={{ boxShadow: '0 2px 12px rgba(139,61,255,0.35)' }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 leading-tight">{meta.title}</h1>
          <p className="text-sm text-ink-500 mt-1 max-w-[60ch]">{subtitle ?? meta.description}</p>
        </div>
      </div>
      {action && <div className="shrink-0 hidden sm:flex gap-2">{action}</div>}
    </div>
  );
}

function InsightRail({ project, stage }: { project: Project; stage: StageKey }) {
  const insight = project.insights[stage];
  const [open, setOpen] = useState(false);
  if (!insight) return null;
  return (
    <div className="card-compact bg-ink-50 border-ink-200">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-left">
        <span className="text-sm font-semibold text-ink-700 flex items-center gap-2">
          <Info className="w-4 h-4 text-ink-500" />
          AI Insight
          <span className={insight.mode === "ai" ? "badge-primary text-[10px] px-2 py-0" : "badge-warning text-[10px] px-2 py-0"}>
            {insight.mode === "ai" ? `AI · ${insight.model}` : `Simulated · ${insight.model}`}
          </span>
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-ink-400" /> : <ChevronDown className="w-4 h-4 text-ink-400" />}
      </button>
      {open && (
        <div className="mt-4 space-y-4">
          {insight.reasoning?.length > 0 && (
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-ink-400 mb-2">Reasoning</p>
              <ul className="space-y-1.5">
                {insight.reasoning.map((r, i) => (
                  <li key={i} className="text-sm text-ink-600 flex gap-2">
                    <span className="text-brand-500 mt-1">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-ink-400 mb-2">Prompt contract (truncated)</p>
            <pre className="text-xs bg-[#0B0C0F] border border-white/[0.06] rounded-xl p-3 overflow-auto max-h-48 whitespace-pre-wrap break-words text-[#A1A1AA]">
              {insight.prompt.slice(0, 900)}
              {insight.prompt.length > 900 ? "…" : ""}
            </pre>
          </div>
          <p className="text-xs text-ink-400">Generated {new Date(insight.generatedAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 85 ? "text-mint-500" : score >= 70 ? "text-amber-500" : "text-ember-500";
  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="currentColor" className="text-ink-100" strokeWidth="3" />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
          fill="none"
          stroke="currentColor"
          className={color}
          strokeWidth="3"
          strokeDasharray={`${score}, 100`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-sm font-bold text-ink-900">{score}</span>
    </div>
  );
}

// ------------------------------------------------------------------
// Main page
// ------------------------------------------------------------------
export default function WorkspacePage() {
  const { project, loading, error, refresh } = useProject();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [genStage, setGenStage] = useState<StageKey | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [regenSeed, setRegenSeed] = useState(0);

  const viewedStage = useMemo(() => {
    const s = searchParams.get("s") as StageKey | null;
    if (s && STAGE_ORDER.includes(s)) return s;
    return (project?.activeStage ?? "discovery") as StageKey;
  }, [searchParams, project?.activeStage]);

  async function runStage(stage: StageKey, extra?: Record<string, unknown>) {
    if (!project) return;
    setGenStage(stage);
    setGenError(null);
    try {
      const res = await fetch(`/api/ai/${stage}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, extra: { seed: regenSeed, ...(extra ?? {}) } }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Generation failed");
      await refresh();
      // after discovery clarification, stay on discovery; otherwise advance view to next stage if current
      if (stage === "discovery" && json.data?.needsClarification) {
        // stay
      } else if (stage === viewedStage) {
        const idx = STAGE_ORDER.indexOf(stage);
        if (idx + 1 < STAGE_ORDER.length) {
          const next = STAGE_ORDER[idx + 1];
          // only auto-navigate if next stage is not yet done
          const nextDone = Boolean(project.stages[next]);
          if (!nextDone) router.push(`/workspace/${project.id}?s=${next}`);
        }
      }
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenStage(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-4" />
        <p className="text-ink-500">Loading your brand workspace…</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="card border-ember-200 bg-ember-50">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-ember-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-ember-800">Could not load this workspace</p>
            <p className="text-sm text-ember-700 mt-1">{error ?? "Project not found."}</p>
            <Link href="/new" className="btn-primary mt-4">
              Create a new brand
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = STAGE_ORDER.filter((k) => Boolean(project.stages[k])).length;
  const progress = Math.round((completedCount / STAGE_ORDER.length) * 100);

  return (
    <div className="space-y-6">
      {/* Project overview card */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-xl font-bold text-ink-900">{project.name}</h2>
              {project.isDemo && <Badge variant="warning">Demo</Badge>}
              <span className="text-xs text-ink-400">{new Date(project.updatedAt).toLocaleDateString()}</span>
            </div>
            <p className="mt-2 text-sm text-ink-600 leading-relaxed bg-ink-50 border border-ink-100 rounded-xl px-3 py-2">
              <span className="font-semibold text-ink-700">Rough idea:</span> “{project.idea}”
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-20 h-2 bg-ink-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-sm font-semibold tabular-nums text-ink-700">{progress}%</span>
            </div>
            <p className="text-xs text-ink-500">
              {completedCount} of {STAGE_ORDER.length} stages complete · next:{" "}
              <span className="font-medium text-ink-700">{STAGE_META[viewedStage].short}</span>
            </p>
            <Link href={`/brand-kit/${project.id}`} target="_blank" className="btn-secondary text-xs mt-1">
              <FileText className="w-4 h-4" />
              Open Brand Kit
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>
          </div>
        </div>

        {/* Mobile stage pill selector */}
        <div className="mt-4 flex gap-1.5 overflow-x-auto scrollbar-thin pb-1 -mx-1 px-1">
          {STAGE_ORDER.map((k) => {
            const active = k === viewedStage;
            const done = Boolean(project.stages[k]);
            return (
              <Link
                key={k}
                href={`/workspace/${project.id}?s=${k}`}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  active ? "bg-[#8B3DFF] text-white border-[#8B3DFF]" : done ? "bg-[#2FD3A5]/10 text-[#45D8B1] border-[#2FD3A5]/20" : "bg-[#18191D] text-[#A1A1AA] border-white/[0.06]"
                }`}
              >
                {STAGE_META[k].short}
                {done ? " ✓" : ""}
              </Link>
            );
          })}
        </div>
      </div>

      {genError && (
        <div className="rounded-xl bg-ember-50 border border-ember-200 px-4 py-3 flex gap-3">
          <AlertCircle className="w-5 h-5 text-ember-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-ember-800">Something went wrong generating this stage.</p>
            <p className="text-sm text-ember-700 mt-1">{genError}</p>
          </div>
          <button onClick={() => setGenError(null)} className="text-ember-600 hover:text-ember-800 p-1">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stage content */}
      <div className="space-y-6">
        {viewedStage === "discovery" && (
          <DiscoveryView project={project} generating={genStage === "discovery"} onGenerate={runStage} onRefresh={refresh} />
        )}
        {viewedStage === "positioning" && (
          <PositioningView project={project} generating={genStage === "positioning"} onGenerate={runStage} onRefresh={refresh} />
        )}
        {viewedStage === "personality" && (
          <PersonalityView project={project} generating={genStage === "personality"} onGenerate={runStage} onRefresh={refresh} />
        )}
        {viewedStage === "naming" && (
          <NamingView project={project} generating={genStage === "naming"} onGenerate={runStage} onRefresh={refresh} regenSeed={regenSeed} setRegenSeed={setRegenSeed} />
        )}
        {viewedStage === "messaging" && (
          <MessagingView project={project} generating={genStage === "messaging"} onGenerate={runStage} onRefresh={refresh} />
        )}
        {viewedStage === "visual" && (
          <VisualView project={project} generating={genStage === "visual"} onGenerate={runStage} onRefresh={refresh} />
        )}
        {viewedStage === "critique" && (
          <CritiqueView project={project} generating={genStage === "critique"} onGenerate={runStage} onRefresh={refresh} />
        )}
        {viewedStage === "consistency" && (
          <ConsistencyView project={project} generating={genStage === "consistency"} onGenerate={runStage} onRefresh={refresh} />
        )}
        {viewedStage === "launch" && (
          <LaunchView project={project} generating={genStage === "launch"} onGenerate={runStage} onRefresh={refresh} />
        )}

        {/* Insight rail for current stage */}
        <InsightRail project={project} stage={viewedStage} />
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Discovery
// ------------------------------------------------------------------
function DiscoveryView({
  project,
  generating,
  onGenerate,
  onRefresh,
}: {
  project: Project;
  generating: boolean;
  onGenerate: (stage: StageKey, extra?: Record<string, unknown>) => void;
  onRefresh: () => Promise<void>;
}) {
  const discovery = project.stages.discovery as Discovery | null;
  const session = project.discoverySession;
  const hasQuestions = session.questions.length > 0;
  const [answers, setAnswers] = useState<Record<string, string>>(() => ({ ...session.answers }));
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Discovery | null>(null);

  useEffect(() => {
    setAnswers({ ...session.answers });
  }, [session.answers, session.questions]);

  useEffect(() => {
    if (discovery) setEditData(discovery);
  }, [discovery]);

  const needsGen = !discovery && !hasQuestions;

  async function saveEdit() {
    if (!editData) return;
    const res = await fetch(`/api/projects/${project.id}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: "discovery", data: editData }),
    });
    const json = await res.json();
    if (!json.ok) alert(json.error);
    else {
      setEditing(false);
      await onRefresh();
    }
  }

  if (discovery && !editing) {
    return (
      <div className="space-y-4">
        <StageHeader
          stage="discovery"
          action={
            <>
              <button onClick={() => setEditing(true)} className="btn-secondary">
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              <button onClick={() => onGenerate("discovery")} disabled={generating} className="btn-ghost">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Regenerate
              </button>
            </>
          }
        />
        <div className="grid gap-4">
          <div className="card">
            <h3 className="font-display font-semibold text-ink-900">Core idea</h3>
            <p className="mt-2 text-ink-700 leading-relaxed">{discovery.coreIdea}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <InfoCard title="Problem solved" text={discovery.problemSolved} />
            <InfoCard title="Target audience" text={discovery.targetAudience} />
          </div>
          <ListCard title="User needs" items={discovery.userNeeds} />
          <InfoCard title="Context" text={discovery.context} />
          <div className="grid md:grid-cols-2 gap-4">
            <ListCard title="Goals" items={discovery.goals} />
            <ListCard title="Constraints" items={discovery.constraints} />
          </div>
          <InfoCard title="Potential value" text={discovery.potentialValue} />
          <div className="grid md:grid-cols-2 gap-4">
            <ListCard title="Open questions" items={discovery.openQuestions} />
            <ListCard title="Assumptions" items={discovery.assumptions} />
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/workspace/${project.id}?s=positioning`} className="btn-primary">
            Continue to Positioning
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (discovery && editing && editData) {
    return (
      <div className="space-y-4">
        <StageHeader stage="discovery" subtitle="Edit the extracted facts — your changes feed every later stage." />
        <div className="card space-y-4">
          <Field label="Core idea" value={editData.coreIdea} onChange={(v) => setEditData({ ...editData, coreIdea: v })} textarea />
          <Field label="Problem solved" value={editData.problemSolved} onChange={(v) => setEditData({ ...editData, problemSolved: v })} textarea />
          <Field label="Target audience" value={editData.targetAudience} onChange={(v) => setEditData({ ...editData, targetAudience: v })} />
          <Field label="Context" value={editData.context} onChange={(v) => setEditData({ ...editData, context: v })} textarea />
          <ListField label="User needs" items={editData.userNeeds} onChange={(items) => setEditData({ ...editData, userNeeds: items })} />
          <ListField label="Goals" items={editData.goals} onChange={(items) => setEditData({ ...editData, goals: items })} />
          <ListField label="Constraints" items={editData.constraints} onChange={(items) => setEditData({ ...editData, constraints: items })} />
          <Field label="Potential value" value={editData.potentialValue} onChange={(v) => setEditData({ ...editData, potentialValue: v })} textarea />
          <ListField label="Open questions" items={editData.openQuestions} onChange={(items) => setEditData({ ...editData, openQuestions: items })} />
          <ListField label="Assumptions" items={editData.assumptions} onChange={(items) => setEditData({ ...editData, assumptions: items })} />
          <div className="flex gap-2 pt-2">
            <button onClick={saveEdit} className="btn-primary">
              <Check className="w-4 h-4" />
              Save changes
            </button>
            <button onClick={() => setEditing(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (hasQuestions) {
    return (
      <div className="space-y-4">
        <StageHeader stage="discovery" subtitle="The AI needs a bit more context before it can build the strategy. Answer what you can — skip anything you don't know yet." />
        <div className="card space-y-5">
          {session.questions.map((q: FollowUpQuestion) => (
            <div key={q.id} className="space-y-2">
              <label className="label flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">?</span>
                <span>
                  {q.question}
                  <span className="block text-xs font-normal text-ink-500 mt-1">Why we ask: {q.why}</span>
                </span>
              </label>
              {q.options?.length ? (
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${answers[q.id] === opt ? "bg-[#8B3DFF] text-white border-[#8B3DFF]" : "bg-[#18191D] text-[#A1A1AA] border-white/[0.06] hover:border-white/[0.12] hover:text-white"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : null}
              <input
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                placeholder={q.options?.length ? "Or write your own answer…" : "Your answer…"}
                className="input"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onGenerate("discovery", { answers })}
              disabled={generating}
              className="btn-primary"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate discovery
            </button>
            <button onClick={() => onGenerate("discovery", { answers: {} })} disabled={generating} className="btn-ghost">
              Skip & generate anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Needs generation
  return (
    <div className="space-y-4">
      <StageHeader stage="discovery" />
      <div className="card text-center py-10">
        <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
          <Search className="w-6 h-6 text-brand-600" />
        </div>
        <h3 className="font-display font-semibold text-lg text-ink-900">Distill your idea into structured strategy</h3>
        <p className="text-sm text-ink-500 max-w-md mx-auto mt-2">
          The Discovery agent will extract audience, problem, needs, constraints and open questions — and ask clarifying questions when
          critical information is missing.
        </p>
        <button onClick={() => onGenerate("discovery")} disabled={generating} className="btn-primary mt-6 mx-auto">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? "Analyzing…" : "Run Discovery"}
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Positioning
// ------------------------------------------------------------------
function PositioningView({
  project,
  generating,
  onGenerate,
  onRefresh,
}: {
  project: Project;
  generating: boolean;
  onGenerate: (s: StageKey, extra?: Record<string, unknown>) => void;
  onRefresh: () => Promise<void>;
}) {
  const positioning = project.stages.positioning as Positioning | null;

  async function select(id: string) {
    if (!positioning) return;
    const next: Positioning = { ...positioning, selectedDirectionId: id };
    const res = await fetch(`/api/projects/${project.id}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: "positioning", data: next }),
    });
    const json = await res.json();
    if (!json.ok) alert(json.error);
    else {
      await onRefresh();
      // also advance activeStage if needed
      await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeStage: "personality" }),
      });
      await onRefresh();
    }
  }

  if (!positioning) {
    const canGenerate = Boolean(project.stages.discovery);
    return (
      <div className="space-y-4">
        <StageHeader stage="positioning" />
        <div className="card text-center py-10">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6 text-brand-600" />
          </div>
          <h3 className="font-display font-semibold text-lg text-ink-900">Explore positioning directions</h3>
          <p className="text-sm text-ink-500 max-w-md mx-auto mt-2">
            Three strategically distinct angles — each with a value proposition, differentiator, competitive angle and fit scores. You pick
            the direction that steers every later stage.
          </p>
          {!canGenerate && <p className="text-xs text-amber-600 mt-3">Complete Discovery first to unlock positioning.</p>}
          <button onClick={() => onGenerate("positioning")} disabled={generating || !canGenerate} className="btn-primary mt-6 mx-auto">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Exploring…" : "Generate Directions"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StageHeader
        stage="positioning"
        action={
          <>
            <button onClick={() => onGenerate("positioning", { seed: Math.random() })} disabled={generating} className="btn-ghost">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Regenerate
            </button>
          </>
        }
      />
      <div className="grid gap-4">
        {positioning.directions.map((dir) => {
          const selected = positioning.selectedDirectionId === dir.id;
          return (
            <div key={dir.id} className={`card text-left ${selected ? "ring-2 ring-brand-500 border-brand-200" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-semibold text-lg text-ink-900">{dir.name}</h3>
                    {selected && <Badge variant="success">Selected</Badge>}
                  </div>
                  <p className="text-sm font-medium text-brand-700 mt-1">{dir.angle}</p>
                  <p className="text-sm text-ink-600 mt-2 leading-relaxed">{dir.summary}</p>
                  <p className="text-xs text-ink-500 mt-2">
                    <span className="font-semibold">Why this angle:</span> {dir.why}
                  </p>
                </div>
                <div className="hidden sm:flex flex-col items-center gap-1 shrink-0">
                  <FitBadge label="Audience" value={dir.fit.audience} />
                  <FitBadge label="Differentiation" value={dir.fit.differentiation} />
                  <FitBadge label="Clarity" value={dir.fit.clarity} />
                </div>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                <KV k="Category" v={dir.productCategory} />
                <KV k="Primary problem" v={dir.primaryProblem} />
                <KV k="Value prop" v={dir.valueProposition} />
                <KV k="Differentiator" v={dir.keyDifferentiator} />
              </div>
              <div className="mt-3 text-sm">
                <p className="font-medium text-ink-700">Positioning statement</p>
                <p className="mt-1 italic text-ink-600 bg-ink-50 border border-ink-100 rounded-xl px-3 py-2">“{dir.positioningStatement}”</p>
              </div>
              {dir.secondaryProblems.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">Secondary problems</p>
                  <ul className="mt-1 flex flex-wrap gap-1.5">
                    {dir.secondaryProblems.map((s) => (
                      <span key={s} className="badge-neutral">
                        {s}
                      </span>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-4 flex gap-2">
                {selected ? (
                  <span className="btn-secondary opacity-60 cursor-default">
                    <CheckCircle2 className="w-4 h-4" />
                    Selected — drives all later stages
                  </span>
                ) : (
                  <button onClick={() => select(dir.id)} className="btn-primary">
                    <Check className="w-4 h-4" />
                    Select this direction
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {positioning.selectedDirectionId && (
        <Link href={`/workspace/${project.id}?s=personality`} className="btn-primary">
          Continue to Personality
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

function FitBadge({ label, value }: { label: string; value: number }) {
  const pct = (value / 5) * 100;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 text-right text-ink-500">{label}</span>
      <div className="w-16 h-1.5 bg-ink-100 rounded-full overflow-hidden">
        <div className="h-full bg-brand-600" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-semibold text-ink-700 tabular-nums">{value}/5</span>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-ink-50 border border-ink-100 rounded-xl px-3 py-2">
      <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">{k}</p>
      <p className="text-ink-700 mt-1">{v}</p>
    </div>
  );
}

// ------------------------------------------------------------------
// Personality
// ------------------------------------------------------------------
function PersonalityView({
  project,
  generating,
  onGenerate,
  onRefresh,
}: {
  project: Project;
  generating: boolean;
  onGenerate: (s: StageKey, extra?: Record<string, unknown>) => void;
  onRefresh: () => Promise<void>;
}) {
  const personality = project.stages.personality as Personality | null;
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Personality | null>(null);
  useEffect(() => {
    if (personality) setEditData(personality);
  }, [personality]);

  async function save() {
    if (!editData) return;
    const res = await fetch(`/api/projects/${project.id}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: "personality", data: editData }),
    });
    const json = await res.json();
    if (!json.ok) alert(json.error);
    else {
      setEditing(false);
      await onRefresh();
    }
  }

  if (!personality) {
    const canGenerate = Boolean(project.stages.positioning);
    return (
      <div className="space-y-4">
        <StageHeader stage="personality" />
        <div className="card text-center py-10">
          <h3 className="font-display font-semibold text-lg text-ink-900">Shape the brand personality</h3>
          <p className="text-sm text-ink-500 max-w-md mx-auto mt-2">Traits, voice and principles — all justified against your audience. The voice must be specific enough to write copy from.</p>
          {!canGenerate && <p className="text-xs text-amber-600 mt-3">Complete Positioning first.</p>}
          <button onClick={() => onGenerate("personality")} disabled={generating || !canGenerate} className="btn-primary mt-6 mx-auto">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Shaping…" : "Generate Personality"}
          </button>
        </div>
      </div>
    );
  }

  if (editing && editData) {
    return (
      <div className="space-y-4">
        <StageHeader stage="personality" subtitle="Edit the personality — your changes update the voice used everywhere else." />
        <div className="card space-y-4">
          <Field label="Communication style" value={editData.communicationStyle} onChange={(v) => setEditData({ ...editData, communicationStyle: v })} textarea />
          <Field label="Justification" value={editData.justification} onChange={(v) => setEditData({ ...editData, justification: v })} textarea />
          <ListField label="Traits (one per line: trait — explanation). Use JSON editing for traits for now." items={editData.traits.map((t) => `${t.trait}: ${t.explanation}`)} onChange={(items) => setEditData({ ...editData, traits: items.map((s) => { const [trait, ...rest] = s.split(":"); return { trait: trait.trim(), explanation: rest.join(":").trim() }; }) })} />
          <ListField label="Traits to avoid" items={editData.traitsToAvoid} onChange={(items) => setEditData({ ...editData, traitsToAvoid: items })} />
          <ListField label="Principles" items={editData.principles} onChange={(items) => setEditData({ ...editData, principles: items })} />
          <div className="flex gap-2 pt-2">
            <button onClick={save} className="btn-primary">
              <Check className="w-4 h-4" />
              Save
            </button>
            <button onClick={() => setEditing(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StageHeader
        stage="personality"
        action={
          <>
            <button onClick={() => setEditing(true)} className="btn-secondary">
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            <button onClick={() => onGenerate("personality")} disabled={generating} className="btn-ghost">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Regenerate
            </button>
          </>
        }
      />
      <div className="grid gap-4">
        <div className="card">
          <h3 className="font-semibold text-ink-900">Traits</h3>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            {personality.traits.map((t) => (
              <div key={t.trait} className="bg-ink-50 border border-ink-100 rounded-xl p-3">
                <p className="font-semibold text-ink-900">{t.trait}</p>
                <p className="text-sm text-ink-600 mt-1">{t.explanation}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <ListCard title="Traits to avoid" items={personality.traitsToAvoid} />
          <ListCard title="Principles" items={personality.principles} />
        </div>
        <ListCard title="Emotional characteristics" items={personality.emotionalCharacteristics} />
        <InfoCard title="Communication style" text={personality.communicationStyle} />
        <div className="card">
          <h3 className="font-semibold text-ink-900">Voice</h3>
          <div className="mt-3 space-y-2">
            {personality.voice.map((v) => (
              <div key={v.characteristic} className="flex gap-3 text-sm">
                <span className="font-semibold text-ink-700 shrink-0 w-32">{v.characteristic}</span>
                <span className="italic text-ink-600">“{v.example}”</span>
              </div>
            ))}
          </div>
          {personality.toneWords.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {personality.toneWords.map((w) => (
                <span key={w} className="badge-primary">
                  {w}
                </span>
              ))}
            </div>
          )}
        </div>
        <InfoCard title="Why this personality fits the audience" text={personality.justification} />
      </div>
      <Link href={`/workspace/${project.id}?s=naming`} className="btn-primary">
        Continue to Naming
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ------------------------------------------------------------------
// Naming
// ------------------------------------------------------------------
function NamingView({
  project,
  generating,
  onGenerate,
  onRefresh,
  regenSeed,
  setRegenSeed,
}: {
  project: Project;
  generating: boolean;
  onGenerate: (s: StageKey, extra?: Record<string, unknown>) => void;
  onRefresh: () => Promise<void>;
  regenSeed: number;
  setRegenSeed: (n: number) => void;
}) {
  const naming = project.stages.naming as Naming | null;

  async function select(id: string) {
    if (!naming) return;
    const res = await fetch(`/api/projects/${project.id}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: "naming", data: { ...naming, selectedId: id } }),
    });
    const json = await res.json();
    if (!json.ok) alert(json.error);
    else await onRefresh();
  }

  if (!naming) {
    const canGenerate = Boolean(project.stages.personality);
    return (
      <div className="space-y-4">
        <StageHeader stage="naming" />
        <div className="card text-center py-10">
          <h3 className="font-display font-semibold text-lg text-ink-900">Generate names in territories</h3>
          <p className="text-sm text-ink-500 max-w-md mx-auto mt-2">Names are grouped into territories (abstract, descriptive, metaphorical…) — each with meaning, reasoning, fit and weaknesses. Never claimed as available.</p>
          {!canGenerate && <p className="text-xs text-amber-600 mt-3">Complete Personality first.</p>}
          <button onClick={() => onGenerate("naming")} disabled={generating || !canGenerate} className="btn-primary mt-6 mx-auto">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Naming…" : "Generate Names"}
          </button>
        </div>
      </div>
    );
  }

  const territories = Array.from(new Set(naming.options.map((o) => o.territory)));

  return (
    <div className="space-y-4">
      <StageHeader
        stage="naming"
        action={
          <button
            onClick={() => {
              setRegenSeed(regenSeed + 1);
              onGenerate("naming", { seed: regenSeed + 1 });
            }}
            disabled={generating}
            className="btn-ghost"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Regenerate
          </button>
        }
      />
      <div className="flex flex-wrap gap-1.5">
        {territories.map((t) => (
          <span key={t} className="badge-neutral">
            {t}
          </span>
        ))}
      </div>
      <div className="grid gap-3">
        {naming.options.map((o) => {
          const selected = naming.selectedId === o.id;
          return (
            <div key={o.id} className={`card-compact text-left ${selected ? "ring-2 ring-brand-500 border-brand-200" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-ink-900">{o.name}</h4>
                    <span className="badge-neutral text-[10px]">{o.territory}</span>
                    {selected && <Badge variant="success">Selected</Badge>}
                  </div>
                  <p className="text-xs text-ink-500 mt-1">/{o.pronunciation}/ · {o.meaning}</p>
                </div>
                {selected ? (
                  <span className="text-xs font-medium text-mint-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Selected
                  </span>
                ) : (
                  <button onClick={() => select(o.id)} className="btn-secondary text-xs px-3 py-1.5">
                    Select
                  </button>
                )}
              </div>
              <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                <KV k="Why this name" v={o.reasoning} />
                <KV k="Brand fit" v={o.brandFit} />
                <KV k="Personality fit" v={o.personalityFit} />
                <KV k="Weakness" v={o.weakness} />
              </div>
              <p className="mt-2 text-xs text-ink-400">{o.availabilityNote}</p>
            </div>
          );
        })}
      </div>
      {naming.selectedId && (
        <Link href={`/workspace/${project.id}?s=messaging`} className="btn-primary">
          Continue to Messaging
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Messaging
// ------------------------------------------------------------------
function MessagingView({
  project,
  generating,
  onGenerate,
  onRefresh,
}: {
  project: Project;
  generating: boolean;
  onGenerate: (s: StageKey, extra?: Record<string, unknown>) => void;
  onRefresh: () => Promise<void>;
}) {
  const messaging = project.stages.messaging as Messaging | null;

  async function pickTagline(t: string) {
    if (!messaging) return;
    const res = await fetch(`/api/projects/${project.id}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: "messaging", data: { ...messaging, selectedTagline: t } }),
    });
    const json = await res.json();
    if (!json.ok) alert(json.error);
    else await onRefresh();
  }

  if (!messaging) {
    const canGenerate = Boolean(project.stages.naming);
    return (
      <div className="space-y-4">
        <StageHeader stage="messaging" />
        <div className="card text-center py-10">
          <h3 className="font-display font-semibold text-lg">Tagline & messaging</h3>
          <p className="text-sm text-ink-500 max-w-md mx-auto mt-2">Written strictly from the selected positioning, personality and name — not regenerated independently.</p>
          {!canGenerate && <p className="text-xs text-amber-600 mt-3">Complete Naming first.</p>}
          <button onClick={() => onGenerate("messaging")} disabled={generating || !canGenerate} className="btn-primary mt-6 mx-auto">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Writing…" : "Generate Messaging"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StageHeader
        stage="messaging"
        action={
          <button onClick={() => onGenerate("messaging")} disabled={generating} className="btn-ghost">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Regenerate
          </button>
        }
      />
      <div className="card">
        <h3 className="font-semibold text-ink-900">Taglines</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {messaging.taglines.map((t) => {
            const selected = messaging.selectedTagline === t;
            return (
              <button
                key={t}
                onClick={() => pickTagline(t)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${selected ? "bg-[#8B3DFF] text-white border-[#8B3DFF]" : "bg-[#18191D] text-[#A1A1AA] border-white/[0.06] hover:border-white/[0.12] hover:text-white"}`}
              >
                “{t}” {selected ? "✓" : ""}
              </button>
            );
          })}
        </div>
      </div>
      <InfoCard title="One-line pitch" text={messaging.oneLinePitch} />
      <InfoCard title="Elevator pitch" text={messaging.elevatorPitch} />
      <InfoCard title="Value proposition" text={messaging.valuePropositionStatement} />
      <InfoCard title="Key message" text={messaging.keyMessage} />
      <ListCard title="Supporting messages" items={messaging.supportingMessages} />
      <div className="card">
        <h3 className="font-semibold text-ink-900">CTAs</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {messaging.ctas.map((c) => (
            <span key={c} className="badge-primary">
              {c}
            </span>
          ))}
        </div>
      </div>
      {messaging.rationale && <InfoCard title="Why this messaging" text={messaging.rationale} />}
      <Link href={`/workspace/${project.id}?s=visual`} className="btn-primary">
        Continue to Visuals
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ------------------------------------------------------------------
// Visual
// ------------------------------------------------------------------
function VisualView({
  project,
  generating,
  onGenerate,
}: {
  project: Project;
  generating: boolean;
  onGenerate: (s: StageKey, extra?: Record<string, unknown>) => void;
  onRefresh: () => Promise<void>;
}) {
  const visual = project.stages.visual as Visual | null;

  if (!visual) {
    const canGenerate = Boolean(project.stages.messaging);
    return (
      <div className="space-y-4">
        <StageHeader stage="visual" />
        <div className="card text-center py-10">
          <h3 className="font-display font-semibold text-lg">Visual direction</h3>
          <p className="text-sm text-ink-500 max-w-md mx-auto mt-2">A structured visual brief — every decision (color, type, shape, logo) is justified against the audience and personality.</p>
          {!canGenerate && <p className="text-xs text-amber-600 mt-3">Complete Messaging first.</p>}
          <button onClick={() => onGenerate("visual")} disabled={generating || !canGenerate} className="btn-primary mt-6 mx-auto">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Designing…" : "Generate Visual Direction"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StageHeader
        stage="visual"
        action={
          <button onClick={() => onGenerate("visual")} disabled={generating} className="btn-ghost">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Regenerate
          </button>
        }
      />
      <div className="card">
        <h3 className="font-display font-semibold text-ink-900">Concept</h3>
        <p className="mt-2 text-ink-700 leading-relaxed">{visual.concept}</p>
        <p className="mt-2 text-sm text-ink-500">{visual.conceptWhy}</p>
      </div>
      <div className="card">
        <h3 className="font-semibold text-ink-900">Color direction</h3>
        <p className="text-sm text-ink-600 mt-1">{visual.colorDirection}</p>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">Primary</p>
            <div className="mt-2 space-y-2">
              {visual.primaryColors.map((c) => (
                <ColorRow key={c.hex} c={c} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">Secondary</p>
            <div className="mt-2 space-y-2">
              {visual.secondaryColors.map((c) => (
                <ColorRow key={c.hex} c={c} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold text-ink-900">Typography</h3>
        <p className="text-sm text-ink-600 mt-1">{visual.typographyDirection}</p>
        <div className="mt-3 space-y-2">
          {visual.fonts.map((f) => (
            <div key={f.name} className="flex gap-3 text-sm">
              <span className="font-semibold text-ink-700 w-32 shrink-0">{f.role}</span>
              <span className="text-ink-600">
                <span className="font-medium text-ink-900">{f.name}</span> — {f.why}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <InfoCard title="Shape language" text={visual.shapeLanguage} />
        <InfoCard title="Imagery" text={visual.imageryStyle} />
        <InfoCard title="Iconography" text={visual.iconography} />
        <InfoCard title="Logo concept" text={visual.logoConcept} />
      </div>
      <InfoCard title="Composition" text={visual.compositionStyle} />
      <InfoCard title="Mood" text={visual.mood} />
      {visual.avoid.length > 0 && <ListCard title="Avoid" items={visual.avoid} />}
      <InfoCard title="Why this fits the audience" text={visual.whyFitsAudience} />
      <Link href={`/workspace/${project.id}?s=critique`} className="btn-primary">
        Continue to Critique
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function ColorRow({ c }: { c: { hex: string; role: string; why: string } }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="w-10 h-10 rounded-xl border border-ink-200 shrink-0" style={{ background: c.hex }} title={c.hex} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-900">
          {c.role} <span className="font-mono text-xs text-ink-500">{c.hex}</span>
        </p>
        <p className="text-xs text-ink-500 leading-relaxed">{c.why}</p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Critique
// ------------------------------------------------------------------
function CritiqueView({
  project,
  generating,
  onGenerate,
  onRefresh,
}: {
  project: Project;
  generating: boolean;
  onGenerate: (s: StageKey, extra?: Record<string, unknown>) => void;
  onRefresh: () => Promise<void>;
}) {
  const critique = project.stages.critique as Critique | null;
  const [busyId, setBusyId] = useState<string | null>(null);

  async function act(issue: CritiqueIssue, action: "accept" | "reject" | "applied") {
    setBusyId(issue.id);
    try {
      const res = await fetch(`/api/projects/${project.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "critique", id: issue.id, action, target: issue.target }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      await onRefresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  if (!critique) {
    const canGenerate = Boolean(project.stages.visual);
    return (
      <div className="space-y-4">
        <StageHeader stage="critique" />
        <div className="card text-center py-10">
          <h3 className="font-display font-semibold text-lg">AI Critic</h3>
          <p className="text-sm text-ink-500 max-w-md mx-auto mt-2">An independent critic that challenges every prior stage — spotting clichés, contradictions, weak positioning and audience mismatch. It does not approve blindly.</p>
          {!canGenerate && <p className="text-xs text-amber-600 mt-3">Complete Visual first.</p>}
          <button onClick={() => onGenerate("critique")} disabled={generating || !canGenerate} className="btn-primary mt-6 mx-auto">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gavel className="w-4 h-4" />}
            {generating ? "Critiquing…" : "Run Critique"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StageHeader
        stage="critique"
        action={
          <button onClick={() => onGenerate("critique")} disabled={generating} className="btn-ghost">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Regenerate
          </button>
        }
      />
      <div className="card flex items-center gap-4">
        <ScoreRing score={critique.score} />
        <div>
          <p className="font-semibold text-ink-900">Brand strength: {critique.score}/100</p>
          <p className="text-sm text-ink-600 mt-1 leading-relaxed">{critique.summary}</p>
        </div>
      </div>
      {critique.strengths.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-ink-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-mint-500" />
            Strengths
          </h3>
          <ul className="mt-2 space-y-1.5">
            {critique.strengths.map((s) => (
              <li key={s} className="text-sm text-ink-600 flex gap-2">
                <span className="text-mint-500">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="space-y-3">
        <h3 className="font-semibold text-ink-900">Issues ({critique.issues.length})</h3>
        {critique.issues.map((issue) => (
          <div key={issue.id} className={`card-compact border-l-4 ${issue.severity === "high" ? "border-l-ember-500" : issue.severity === "medium" ? "border-l-amber-500" : "border-l-ink-300"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge ${issue.severity === "high" ? "bg-ember-100 text-ember-700" : issue.severity === "medium" ? "bg-amber-100 text-amber-700" : "bg-ink-100 text-ink-600"}`}>{issue.severity}</span>
                  <span className="text-xs font-semibold tracking-widest uppercase text-ink-400">{issue.type}</span>
                  {issue.status !== "open" && <Badge variant={issue.status === "accepted" || issue.status === "applied" ? "success" : "neutral"}>{issue.status}</Badge>}
                </div>
                <p className="font-semibold text-ink-900 mt-2">{issue.issue}</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">Why it is a problem</p>
                    <p className="text-ink-600 mt-1">{issue.whyProblem}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">Evidence</p>
                    <p className="text-ink-600 mt-1 italic">“{issue.evidence}”</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">Suggested improvement</p>
                    <p className="text-ink-600 mt-1">{issue.suggestion}</p>
                  </div>
                  {issue.target && (
                    <p className="text-xs text-ink-500 mt-2">
                      Targets: <code className="px-1.5 py-0.5 bg-ink-100 rounded">{issue.target.stage}.{issue.target.path}</code>
                      {issue.target.label ? ` — ${issue.target.label}` : ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {issue.status === "open" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => act(issue, "accept")} disabled={busyId === issue.id} className="btn-secondary text-xs">
                  {busyId === issue.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  Accept
                </button>
                <button onClick={() => act(issue, "reject")} disabled={busyId === issue.id} className="btn-ghost text-xs">
                  <XCircle className="w-3 h-3" />
                  Reject
                </button>
                {issue.target && (
                  <button onClick={() => act(issue, "applied")} disabled={busyId === issue.id} className="btn-primary text-xs">
                    <Sparkles className="w-3 h-3" />
                    Apply fix
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <Link href={`/workspace/${project.id}?s=consistency`} className="btn-primary">
        Continue to Consistency
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ------------------------------------------------------------------
// Consistency
// ------------------------------------------------------------------
function ConsistencyView({
  project,
  generating,
  onGenerate,
  onRefresh,
}: {
  project: Project;
  generating: boolean;
  onGenerate: (s: StageKey, extra?: Record<string, unknown>) => void;
  onRefresh: () => Promise<void>;
}) {
  const report = project.stages.consistency as ConsistencyReport | null;
  const [busyId, setBusyId] = useState<string | null>(null);

  async function act(conflict: ConsistencyConflict, action: "accept" | "reject" | "applied") {
    setBusyId(conflict.id);
    try {
      const res = await fetch(`/api/projects/${project.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "consistency", id: conflict.id, action, target: conflict.target }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      await onRefresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  if (!report) {
    const canGenerate = Boolean(project.stages.critique);
    return (
      <div className="space-y-4">
        <StageHeader stage="consistency" />
        <div className="card text-center py-10">
          <h3 className="font-display font-semibold text-lg">Consistency Guardian</h3>
          <p className="text-sm text-ink-500 max-w-md mx-auto mt-2">Checks whether name, positioning, personality, messaging and visuals feel like ONE brand — across every surface.</p>
          {!canGenerate && <p className="text-xs text-amber-600 mt-3">Complete Critique first.</p>}
          <button onClick={() => onGenerate("consistency")} disabled={generating || !canGenerate} className="btn-primary mt-6 mx-auto">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
            {generating ? "Checking…" : "Run Consistency Check"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StageHeader
        stage="consistency"
        action={
          <button onClick={() => onGenerate("consistency")} disabled={generating} className="btn-ghost">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Regenerate
          </button>
        }
      />
      <div className="card flex items-center gap-4">
        <ScoreRing score={report.score} />
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={report.status === "aligned" ? "success" : report.status === "attention" ? "warning" : "danger"}>{report.status}</Badge>
            <span className="font-semibold text-ink-900">{report.score}/100</span>
          </div>
          <p className="text-sm text-ink-600 mt-1 leading-relaxed">{report.summary}</p>
        </div>
      </div>
      {report.strengths.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-ink-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-mint-500" />
            Strengths
          </h3>
          <ul className="mt-2 space-y-1.5">
            {report.strengths.map((s) => (
              <li key={s} className="text-sm text-ink-600 flex gap-2">
                <span className="text-mint-500">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {report.conflicts.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-semibold text-ink-900">Conflicts ({report.conflicts.length})</h3>
          {report.conflicts.map((c) => (
            <div key={c.id} className={`card-compact border-l-4 ${c.severity === "high" ? "border-l-ember-500" : c.severity === "medium" ? "border-l-amber-500" : "border-l-ink-300"}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`badge ${c.severity === "high" ? "bg-ember-100 text-ember-700" : c.severity === "medium" ? "bg-amber-100 text-amber-700" : "bg-ink-100 text-ink-600"}`}>{c.severity}</span>
                <span className="text-xs text-ink-500">{c.components.join(" × ")}</span>
                {c.status !== "open" && <Badge variant={c.status === "accepted" || c.status === "applied" ? "success" : "neutral"}>{c.status}</Badge>}
              </div>
              <p className="font-semibold text-ink-900 mt-2">{c.conflict}</p>
              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">Explanation</p>
                  <p className="text-ink-600 mt-1">{c.explanation}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">Recommended correction</p>
                  <p className="text-ink-600 mt-1">{c.correction}</p>
                </div>
              </div>
              {c.status === "open" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => act(c, "accept")} disabled={busyId === c.id} className="btn-secondary text-xs">
                    {busyId === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Accept
                  </button>
                  <button onClick={() => act(c, "reject")} disabled={busyId === c.id} className="btn-ghost text-xs">
                    <XCircle className="w-3 h-3" />
                    Reject
                  </button>
                  {c.target && (
                    <button onClick={() => act(c, "applied")} disabled={busyId === c.id} className="btn-primary text-xs">
                      <Sparkles className="w-3 h-3" />
                      Apply fix
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-6">
          <CheckCircle2 className="w-8 h-8 text-mint-500 mx-auto" />
          <p className="font-semibold text-ink-900 mt-2">No conflicts detected</p>
          <p className="text-sm text-ink-500 mt-1">Every stage reads as one brand system.</p>
        </div>
      )}
      <Link href={`/workspace/${project.id}?s=launch`} className="btn-primary">
        Continue to Launch
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ------------------------------------------------------------------
// Launch
// ------------------------------------------------------------------
function LaunchView({
  project,
  generating,
  onGenerate,
}: {
  project: Project;
  generating: boolean;
  onGenerate: (s: StageKey, extra?: Record<string, unknown>) => void;
  onRefresh: () => Promise<void>;
}) {
  const launch = project.stages.launch as Launch | null;

  if (!launch) {
    const canGenerate = Boolean(project.stages.consistency);
    return (
      <div className="space-y-4">
        <StageHeader stage="launch" />
        <div className="card text-center py-10">
          <h3 className="font-display font-semibold text-lg">Launch assets</h3>
          <p className="text-sm text-ink-500 max-w-md mx-auto mt-2">Practical launch content — landing copy, social posts and product messaging — all on-brand and ready to ship.</p>
          {!canGenerate && <p className="text-xs text-amber-600 mt-3">Complete Consistency first.</p>}
          <button onClick={() => onGenerate("launch")} disabled={generating || !canGenerate} className="btn-primary mt-6 mx-auto">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            {generating ? "Building…" : "Generate Launch Assets"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StageHeader
        stage="launch"
        action={
          <button onClick={() => onGenerate("launch")} disabled={generating} className="btn-ghost">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Regenerate
          </button>
        }
      />
      <div className="card">
        <h3 className="font-semibold text-ink-900 flex items-center gap-2">
          <Rocket className="w-4 h-4 text-brand-600" />
          Landing page
        </h3>
        <div className="mt-3 space-y-3">
          <div className="bg-gradient-to-br from-[#0B0C0F] to-[#2E1A62] rounded-2xl p-6 text-white border border-white/[0.06]">
            <p className="font-display text-2xl font-bold">{launch.landing.heroHeadline}</p>
            <p className="text-[#C084FC]/80 mt-2 leading-relaxed">{launch.landing.subheadline}</p>
            <span className="inline-flex mt-4 px-4 py-2 rounded-xl bg-white text-[#08090B] text-sm font-semibold">{launch.landing.cta}</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {launch.landing.features.map((f) => (
              <div key={f.title} className="bg-ink-50 border border-ink-100 rounded-xl p-3">
                <p className="font-semibold text-ink-900 text-sm">{f.title}</p>
                <p className="text-sm text-ink-600 mt-1">{f.description}</p>
              </div>
            ))}
          </div>
          <InfoCard title="About" text={launch.landing.about} />
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-ink-900">Social</h3>
        <div className="mt-3 grid gap-3">
          <CopyBlock label="Launch post" text={launch.social.launchPost} />
          <CopyBlock label="Short announcement" text={launch.social.shortAnnouncement} />
          <CopyBlock label="X / Twitter" text={launch.social.twitter} />
          <CopyBlock label="LinkedIn" text={launch.social.linkedin} />
          <CopyBlock label="Instagram" text={launch.social.instagram} />
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-ink-900">Product messaging</h3>
        <div className="mt-3 space-y-3">
          <CopyBlock label="App description" text={launch.productMessaging.appDescription} />
          <CopyBlock label="Short description" text={launch.productMessaging.shortDescription} />
          <CopyBlock label="Elevator pitch" text={launch.productMessaging.elevatorPitch} />
          <CopyBlock label="App Store description" text={launch.productMessaging.appStoreDescription} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={`/brand-kit/${project.id}`} target="_blank" className="btn-primary">
          <FileText className="w-4 h-4" />
          Open Brand Kit
          <ExternalLink className="w-3 h-3 opacity-60" />
        </Link>
        <Link href={`/workspace/${project.id}`} className="btn-secondary">
          Back to overview
        </Link>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Small shared pieces
// ------------------------------------------------------------------
function InfoCard({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  return (
    <div className="card-compact">
      <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">{title}</p>
      <p className="mt-1 text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="card-compact">
      <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((it) => (
          <li key={it} className="text-sm text-ink-700 flex gap-2">
            <span className="text-brand-500 mt-1">•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-ink-50 border border-ink-100 rounded-xl p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">{label}</p>
        <button
          onClick={() => {
            copyText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
          className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-700"
        >
          <Copy className="w-3 h-3" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-2 text-sm text-ink-700 whitespace-pre-wrap leading-relaxed">{text}</p>
    </div>
  );
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div>
      <label className="label">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="textarea" rows={3} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="input" />
      )}
    </div>
  );
}

function ListField({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  const [raw, setRaw] = useState(items.join("\n"));
  useEffect(() => setRaw(items.join("\n")), [items]);
  return (
    <div>
      <label className="label">{label} — one per line</label>
      <textarea value={raw} onChange={(e) => setRaw(e.target.value)} onBlur={() => onChange(raw.split("\n").map((s) => s.trim()).filter(Boolean))} className="textarea" rows={4} />
    </div>
  );
}
