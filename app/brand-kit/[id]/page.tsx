"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Printer, Copy, ExternalLink, Sparkles, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import type { Project } from "@/lib/types";
import { STAGE_META } from "@/lib/types";

function copyAll(project: Project) {
  const parts: string[] = [];
  parts.push(`# ${project.name} — Brand Kit`);
  parts.push(`Idea: ${project.idea}`);
  if (project.stages.discovery) {
    parts.push(`\n## Discovery\n${project.stages.discovery.coreIdea}\nAudience: ${project.stages.discovery.targetAudience}\nProblem: ${project.stages.discovery.problemSolved}`);
  }
  if (project.stages.positioning) {
    const sel = project.stages.positioning.directions.find((d) => d.id === project.stages.positioning!.selectedDirectionId) ?? project.stages.positioning.directions[0];
    if (sel) parts.push(`\n## Positioning — ${sel.name}\n${sel.positioningStatement}\nDifferentiator: ${sel.keyDifferentiator}`);
  }
  if (project.stages.personality) {
    parts.push(`\n## Personality\n${project.stages.personality.traits.map((t) => `- ${t.trait}: ${t.explanation}`).join("\n")}`);
  }
  if (project.stages.naming) {
    const sel = project.stages.naming.options.find((o) => o.id === project.stages.naming!.selectedId);
    if (sel) parts.push(`\n## Name — ${sel.name}\n${sel.meaning}\nWhy: ${project.stages.naming.whyThisName || sel.reasoning}`);
  }
  if (project.stages.messaging) parts.push(`\n## Messaging\nTagline: ${project.stages.messaging.selectedTagline}\nPitch: ${project.stages.messaging.oneLinePitch}`);
  if (project.stages.visual) parts.push(`\n## Visual\nConcept: ${project.stages.visual.concept}\nMood: ${project.stages.visual.mood}`);
  if (project.stages.launch) parts.push(`\n## Launch\nHero: ${project.stages.launch.landing.heroHeadline}\nSub: ${project.stages.launch.landing.subheadline}`);
  const text = parts.join("\n");
  navigator.clipboard.writeText(text).catch(() => {});
}

export default function BrandKitPage() {
  const params = useParams() as { id: string };
  const id = params.id;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/projects/${id}`, { cache: "no-store" });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error);
        setProject(json.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper-100 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-paper-100 flex items-center justify-center px-4">
        <div className="card border-ember-200 bg-ember-50 max-w-md w-full">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-ember-500 shrink-0" />
            <div>
              <p className="font-semibold text-ember-800">Could not load Brand Kit</p>
              <p className="text-sm text-ember-700 mt-1">{error ?? "Not found"}</p>
              <Link href="/" className="btn-primary mt-4">
                Go home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const s = project.stages;
  const selectedPositioning = s.positioning?.directions.find((d) => d.id === s.positioning!.selectedDirectionId) ?? s.positioning?.directions[0] ?? null;
  const selectedName = s.naming?.options.find((o) => o.id === s.naming!.selectedId) ?? null;

  return (
    <div className="min-h-screen bg-[#08090B] print:bg-white text-[#F5F5F5] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden print:hidden">
        <div className="absolute -top-[20%] right-[-15%] w-[800px] h-[800px] blob-purple opacity-30" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] blob-purple-soft opacity-15" />
      </div>
      <style>{`@media print { .no-print { display: none !important; } .print-break { break-inside: avoid; } body { background: white !important; } }`}</style>

      {/* Top bar – no print */}
      <header className="no-print sticky top-0 z-30 bg-[#08090B]/70 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link href={`/workspace/${project.id}`} className="flex items-center gap-2 text-sm text-ink-600 hover:text-ink-900">
            <ArrowLeft className="w-4 h-4" />
            Back to workspace
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                copyAll(project);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              }}
              className="btn-secondary text-sm"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied" : "Copy all"}
            </button>
            <button onClick={() => window.print()} className="btn-primary text-sm">
              <Printer className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Cover */}
        <div className="relative rounded-3xl p-8 sm:p-12 text-white print-break overflow-hidden border border-white/[0.06]" style={{ background: 'linear-gradient(135deg, #0B0C0F 0%, #121316 40%, #1A102E 70%, #8B3DFF 100%)', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139,61,255,0.15)' }}>
          <div className="absolute -right-[10%] -top-[30%] w-[500px] h-[500px] blob-purple opacity-20 pointer-events-none" />
          <div className="flex items-center gap-2 text-brand-200 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            BrandForge AI · Brand Kit
            {project.isDemo && <span className="ml-2 px-2 py-0.5 rounded-full bg-white/15 text-white text-xs">Demo</span>}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-4 leading-tight">{project.name}</h1>
          <p className="text-brand-100 mt-3 leading-relaxed max-w-2xl">“{project.idea}”</p>
          <p className="text-xs text-brand-200/70 mt-6">Generated {new Date(project.updatedAt).toLocaleDateString()} · Shareable view · Print to PDF</p>
          <div className="no-print mt-6 flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="btn bg-white text-[#08090B] hover:bg-white/90">
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
            <Link href={`/workspace/${project.id}`} className="btn bg-white/10 text-white border border-white/20 hover:bg-white/15">
              Open in workspace
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Table of contents – no print */}
        <nav className="no-print mt-8 card-compact">
          <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">Contents</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              "Overview",
              "Audience",
              "Problem",
              "Positioning",
              "Value prop",
              "Personality",
              "Principles",
              "Name",
              "Tagline",
              "Voice",
              "Visual",
              "Colors",
              "Typography",
              "Logo",
              "Messaging",
              "Critique",
              "Consistency",
              "Launch",
            ].map((label) => (
              <span key={label} className="badge-neutral text-xs">
                {label}
              </span>
            ))}
          </div>
        </nav>

        {/* Sections */}
        <div className="mt-8 grid gap-6">
          {/* 1-6 Overview */}
          <Section title="1 · Brand overview" k="Overview">
            <p className="text-ink-700 leading-relaxed">{s.discovery?.coreIdea ?? "No discovery yet — run the Discovery stage to fill this section."}</p>
            {s.discovery && (
              <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                <KV k="Context" v={s.discovery.context} />
                <KV k="Potential value" v={s.discovery.potentialValue} />
              </div>
            )}
          </Section>

          <Section title="2 · Target audience" k="Audience">
            <p className="text-ink-700 leading-relaxed">{s.discovery?.targetAudience ?? "—"}</p>
            {s.discovery?.userNeeds?.length ? (
              <ul className="mt-3 space-y-1.5">
                {s.discovery.userNeeds.map((n) => (
                  <li key={n} className="text-sm text-ink-600 flex gap-2">
                    <span className="text-brand-500">•</span>
                    {n}
                  </li>
                ))}
              </ul>
            ) : null}
          </Section>

          <Section title="3 · Problem" k="Problem">
            <p className="text-ink-700 leading-relaxed">{s.discovery?.problemSolved ?? "—"}</p>
            {s.discovery?.openQuestions?.length ? (
              <div className="mt-3">
                <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">Open questions</p>
                <ul className="mt-1 space-y-1">
                  {s.discovery.openQuestions.map((q) => (
                    <li key={q} className="text-sm text-ink-600">
                      • {q}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Section>

          <Section title="4 · Positioning" k="Positioning">
            {selectedPositioning ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-display font-semibold text-ink-900">{selectedPositioning.name}</h4>
                  <span className="badge-success text-xs">Selected</span>
                </div>
                <p className="text-sm font-medium text-brand-700">{selectedPositioning.angle}</p>
                <p className="text-sm text-ink-600 leading-relaxed">{selectedPositioning.summary}</p>
                <p className="text-sm italic text-ink-700 bg-ink-50 border border-ink-100 rounded-xl px-3 py-2">“{selectedPositioning.positioningStatement}”</p>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <KV k="Category" v={selectedPositioning.productCategory} />
                  <KV k="Differentiator" v={selectedPositioning.keyDifferentiator} />
                  <KV k="Competitive angle" v={selectedPositioning.competitiveAngle} />
                  <KV k="Value prop" v={selectedPositioning.valueProposition} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink-500">No positioning selected yet.</p>
            )}
          </Section>

          <Section title="5 · Value proposition" k="Value prop">
            <p className="text-ink-700 leading-relaxed">{selectedPositioning?.valueProposition ?? s.messaging?.valuePropositionStatement ?? "—"}</p>
          </Section>

          <Section title="6 · Brand personality" k="Personality">
            {s.personality ? (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  {s.personality.traits.map((t) => (
                    <div key={t.trait} className="bg-ink-50 border border-ink-100 rounded-xl p-3">
                      <p className="font-semibold text-ink-900">{t.trait}</p>
                      <p className="text-sm text-ink-600 mt-1">{t.explanation}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-ink-500">Avoid: {s.personality.traitsToAvoid.join(" · ")}</p>
              </div>
            ) : (
              <p className="text-sm text-ink-500">—</p>
            )}
          </Section>

          <Section title="7 · Brand principles" k="Principles">
            {s.personality?.principles?.length ? (
              <ul className="space-y-1.5">
                {s.personality.principles.map((p) => (
                  <li key={p} className="text-sm text-ink-700 flex gap-2">
                    <span className="text-brand-500">—</span>
                    {p}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-500">—</p>
            )}
          </Section>

          <Section title="8 · Selected name" k="Name">
            {selectedName ? (
              <div>
                <h4 className="font-display text-2xl font-bold text-ink-900">{selectedName.name}</h4>
                <p className="text-sm text-ink-500 mt-1">
                  {selectedName.territory} · /{selectedName.pronunciation}/
                </p>
                <p className="text-sm text-ink-700 mt-3 leading-relaxed">{selectedName.meaning}</p>
                <p className="text-sm text-ink-600 mt-2">{selectedName.reasoning}</p>
                <p className="text-xs text-ink-400 mt-2">{selectedName.availabilityNote}</p>
              </div>
            ) : (
              <p className="text-sm text-ink-500">No name selected yet.</p>
            )}
          </Section>

          <Section title="9 · Naming rationale" k="Naming rationale">
            <p className="text-sm text-ink-700 leading-relaxed">{s.naming?.whyThisName || selectedName?.reasoning || "—"}</p>
          </Section>

          <Section title="10 · Tagline" k="Tagline">
            <p className="font-display text-xl font-bold text-ink-900">“{s.messaging?.selectedTagline ?? "—"}”</p>
            {s.messaging?.taglines?.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.messaging.taglines.map((t) => (
                  <span key={t} className={`badge ${t === s.messaging?.selectedTagline ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600"}`}>
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </Section>

          <Section title="11 · One-line pitch" k="Pitch">
            <p className="text-ink-700 leading-relaxed">{s.messaging?.oneLinePitch ?? "—"}</p>
            {s.messaging?.elevatorPitch && <p className="text-sm text-ink-600 mt-3 leading-relaxed">{s.messaging.elevatorPitch}</p>}
          </Section>

          <Section title="12 · Brand voice" k="Voice">
            {s.personality ? (
              <div className="space-y-3">
                <p className="text-sm text-ink-700 leading-relaxed">{s.personality.communicationStyle}</p>
                <div className="space-y-1.5">
                  {s.personality.voice.map((v) => (
                    <div key={v.characteristic} className="flex gap-3 text-sm">
                      <span className="font-semibold text-ink-700 w-32 shrink-0">{v.characteristic}</span>
                      <span className="italic text-ink-600">“{v.example}”</span>
                    </div>
                  ))}
                </div>
                {s.personality.toneWords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {s.personality.toneWords.map((w) => (
                      <span key={w} className="badge-primary">
                        {w}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-ink-500">—</p>
            )}
          </Section>

          <Section title="13 · Visual direction" k="Visual">
            {s.visual ? (
              <div className="space-y-3">
                <p className="text-ink-700 leading-relaxed">{s.visual.concept}</p>
                <p className="text-sm text-ink-500">{s.visual.conceptWhy}</p>
                <p className="text-sm text-ink-700">
                  <span className="font-semibold">Mood:</span> {s.visual.mood}
                </p>
              </div>
            ) : (
              <p className="text-sm text-ink-500">—</p>
            )}
          </Section>

          <Section title="14 · Color palette" k="Colors">
            {s.visual ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">Primary</p>
                  <div className="mt-2 space-y-2">
                    {s.visual.primaryColors.map((c) => (
                      <div key={c.hex} className="flex gap-3 items-start">
                        <span className="w-10 h-10 rounded-xl border border-ink-200 shrink-0" style={{ background: c.hex }} />
                        <div>
                          <p className="text-sm font-medium text-ink-900">
                            {c.role} <span className="font-mono text-xs text-ink-500">{c.hex}</span>
                          </p>
                          <p className="text-xs text-ink-500">{c.why}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">Secondary</p>
                  <div className="mt-2 space-y-2">
                    {s.visual.secondaryColors.map((c) => (
                      <div key={c.hex} className="flex gap-3 items-start">
                        <span className="w-10 h-10 rounded-xl border border-ink-200 shrink-0" style={{ background: c.hex }} />
                        <div>
                          <p className="text-sm font-medium text-ink-900">
                            {c.role} <span className="font-mono text-xs text-ink-500">{c.hex}</span>
                          </p>
                          <p className="text-xs text-ink-500">{c.why}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink-500">—</p>
            )}
          </Section>

          <Section title="15 · Typography" k="Typography">
            {s.visual ? (
              <div className="space-y-2">
                <p className="text-sm text-ink-600">{s.visual.typographyDirection}</p>
                {s.visual.fonts.map((f) => (
                  <div key={f.name} className="flex gap-3 text-sm">
                    <span className="font-semibold text-ink-700 w-32 shrink-0">{f.role}</span>
                    <span className="text-ink-600">
                      <span className="font-medium text-ink-900">{f.name}</span> — {f.why}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500">—</p>
            )}
          </Section>

          <Section title="16 · Logo concept" k="Logo">
            <p className="text-ink-700 leading-relaxed">{s.visual?.logoConcept ?? "—"}</p>
            {s.visual && <p className="text-sm text-ink-600 mt-2">Shape language: {s.visual.shapeLanguage}</p>}
          </Section>

          <Section title="17 · Messaging" k="Messaging">
            {s.messaging ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Key message:</span> {s.messaging.keyMessage}
                </p>
                <ul className="space-y-1">
                  {s.messaging.supportingMessages.map((m) => (
                    <li key={m} className="text-ink-600">
                      • {m}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5">
                  {s.messaging.ctas.map((c) => (
                    <span key={c} className="badge-primary">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink-500">—</p>
            )}
          </Section>

          <Section title="18 · AI critique" k="Critique">
            {s.critique ? (
              <div className="space-y-3">
                <p className="text-sm">
                  <span className="font-semibold">Score:</span> <span className="font-mono">{s.critique.score}/100</span> · {s.critique.summary}
                </p>
                {s.critique.issues.length > 0 && (
                  <ul className="space-y-2">
                    {s.critique.issues.map((iss) => (
                      <li key={iss.id} className="text-sm bg-ink-50 border border-ink-100 rounded-xl px-3 py-2">
                        <span className="font-semibold text-ink-900">{iss.type}:</span> {iss.issue}{" "}
                        <span className="text-ink-500">— {iss.suggestion}</span>
                        <span className={`ml-2 badge ${iss.severity === "high" ? "bg-ember-100 text-ember-700" : iss.severity === "medium" ? "bg-amber-100 text-amber-700" : "bg-ink-100 text-ink-600"}`}>
                          {iss.severity}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="text-sm text-ink-500">Not yet run.</p>
            )}
          </Section>

          <Section title="19 · Consistency report" k="Consistency">
            {s.consistency ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Status:</span> {s.consistency.status} · <span className="font-mono">{s.consistency.score}/100</span>
                </p>
                <p className="text-ink-600">{s.consistency.summary}</p>
                {s.consistency.conflicts.length > 0 && (
                  <ul className="space-y-2">
                    {s.consistency.conflicts.map((c) => (
                      <li key={c.id} className="bg-ink-50 border border-ink-100 rounded-xl px-3 py-2">
                        <span className="font-semibold text-ink-900">{c.conflict}</span>
                        <span className="text-ink-600"> — {c.correction}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="text-sm text-ink-500">Not yet run.</p>
            )}
          </Section>

          <Section title="20 · Launch content" k="Launch">
            {s.launch ? (
              <div className="space-y-4 text-sm">
                <div className="bg-gradient-to-br from-[#0B0C0F] to-[#2E1A62] rounded-2xl p-6 text-white border border-white/[0.06]">
                  <p className="font-display text-xl font-bold">{s.launch.landing.heroHeadline}</p>
                  <p className="text-[#C084FC]/80 mt-2">{s.launch.landing.subheadline}</p>
                  <span className="inline-flex mt-3 px-3 py-1.5 rounded-xl bg-white text-[#08090B] text-xs font-semibold">{s.launch.landing.cta}</span>
                </div>
                <div>
                  <p className="font-semibold text-ink-900">Social</p>
                  <p className="text-ink-600 whitespace-pre-wrap mt-1">{s.launch.social.launchPost}</p>
                </div>
                <div>
                  <p className="font-semibold text-ink-900">Product</p>
                  <p className="text-ink-600 mt-1">{s.launch.productMessaging.appDescription}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink-500">Not yet generated.</p>
            )}
          </Section>
        </div>

        <div className="no-print mt-10 flex flex-wrap gap-2">
          <button onClick={() => window.print()} className="btn-primary">
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
          <button
            onClick={() => {
              copyAll(project);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            className="btn-secondary"
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copied" : "Copy all text"}
          </button>
          <Link href={`/workspace/${project.id}`} className="btn-ghost">
            Back to workspace
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-ink-400">BrandForge AI — shareable Brand Kit · <span className="font-mono">{project.id}</span></p>
      </main>
    </div>
  );
}

function Section({ title, k, children }: { title: string; k: string; children: React.ReactNode }) {
  return (
    <section className="card print-break">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-7 h-7 rounded-lg bg-[#8B3DFF] text-white flex items-center justify-center text-xs font-bold">{k[0]}</span>
        <h2 className="font-display font-semibold text-ink-900">{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-ink-50 border border-ink-100 rounded-xl px-3 py-2">
      <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">{k}</p>
      <p className="text-sm text-ink-700 mt-1">{v}</p>
    </div>
  );
}
