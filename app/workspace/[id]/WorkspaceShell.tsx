"use client";
import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Search,
  Target,
  Sparkles,
  PenTool,
  MessageSquare,
  Palette,
  Gavel,
  Scale,
  Rocket,
  LayoutDashboard,
  Menu,
  X,
  FileText,
  ExternalLink,
} from "lucide-react";
import { ProjectProvider, useProject } from "@/components/workspace/ProjectContext";
import type { StageKey } from "@/lib/types";
import { STAGE_ORDER, STAGE_META } from "@/lib/types";

const STAGE_ICONS: Record<StageKey, typeof Search> = {
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

function ShellInner({ children }: { children: React.ReactNode }) {
  const { project, loading } = useProject();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const searchParams = useSearchParams();
  const activeStage = project?.activeStage ?? "discovery";
  const completedKeys = new Set<string>();
  if (project) {
    for (const k of STAGE_ORDER) {
      if (project.stages[k as StageKey]) completedKeys.add(k);
    }
  }
  const progress = project ? Math.round((completedKeys.size / STAGE_ORDER.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#08090B] flex flex-col text-[#F5F5F5]">
      {/* Top nav */}
      <header className="sticky top-0 z-30 bg-[#08090B]/70 backdrop-blur-xl border-b border-white/[0.06] h-14 flex items-center px-4 gap-3">
        <button
          onClick={() => setDrawerOpen((v) => !v)}
          className="lg:hidden p-2 rounded-xl hover:bg-white/[0.06] text-[#A1A1AA] hover:text-white"
          aria-label="Toggle navigation"
        >
          {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link href="/" className="flex items-center gap-2 font-display font-bold text-white shrink-0">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B3DFF, #A855F7)', boxShadow: '0 2px 12px rgba(139,61,255,0.35)' }}>
            <Sparkles className="w-4 h-4 text-white" />
          </span>
          <span className="hidden sm:inline">BrandForge AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-2 ml-6 text-sm truncate">
          <span className="truncate max-w-[28ch] font-medium text-white">
            {loading ? "Loading…" : project?.name ?? "Untitled brand"}
          </span>
          {project?.isDemo && <span className="badge-warning shrink-0 text-xs">Demo</span>}
        </div>

        <div className="flex-1" />

        <div className="hidden sm:flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 mr-2">
            <div className="w-24 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full transition-all" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #8B3DFF, #A855F7)' }} />
            </div>
            <span className="text-xs font-medium text-[#A1A1AA] tabular-nums">{progress}%</span>
          </div>
          {project && (
            <Link
              href={`/brand-kit/${project.id}`}
              target="_blank"
              className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#18191D] border border-white/[0.06] text-[#A1A1AA] hover:text-white hover:bg-[#202126] transition-colors"
            >
              <FileText className="w-4 h-4" />
              Brand Kit
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>
          )}
          <Link href="/new" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #8B3DFF, #A855F7)', boxShadow: '0 2px 12px rgba(139,61,255,0.3)' }}>
            New brand
          </Link>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar – desktop */}
        <aside className="hidden lg:flex w-[248px] shrink-0 bg-[#0B0C0F] border-r border-white/[0.06] flex-col sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto scrollbar-thin">
          <SidebarContent
            projectId={project?.id}
            activeStage={activeStage}
            completed={completedKeys}
            loading={loading}
          />
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-[288px] bg-[#0B0C0F] border-r border-white/[0.06] overflow-y-auto scrollbar-thin animate-slide-up">
              <div className="p-4 flex items-center justify-between border-b border-white/[0.06]">
                <span className="font-display font-bold text-white">Navigate</span>
                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-xl hover:bg-white/[0.06] text-[#A1A1AA]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent
                projectId={project?.id}
                activeStage={activeStage}
                completed={completedKeys}
                loading={loading}
                onNavigate={() => setDrawerOpen(false)}
              />
            </aside>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-[#08090B]">
          <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  projectId,
  activeStage,
  completed,
  loading,
  onNavigate,
}: {
  projectId?: string;
  activeStage: StageKey;
  completed: Set<string>;
  loading: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewed = (searchParams.get("s") as StageKey | null) ?? activeStage;
  const isActive = (key: string) => viewed === key;

  return (
    <nav className="p-3 space-y-4">
      <div>
        <p className="px-3 py-2 text-[11px] font-semibold tracking-widest uppercase text-[#71717A]">Workspace</p>
        <Link
          href={projectId ? `/workspace/${projectId}` : "/"}
          onClick={onNavigate}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            pathname === `/workspace/${projectId}` ? "bg-[#8B3DFF]/15 text-[#C084FC] border border-[#8B3DFF]/20" : "text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white"
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          Overview
        </Link>
        {projectId && (
          <Link
            href={`/brand-kit/${projectId}`}
            target="_blank"
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white"
          >
            <FileText className="w-4 h-4 shrink-0" />
            Brand Kit
            <ExternalLink className="w-3 h-3 ml-auto opacity-40" />
          </Link>
        )}
      </div>

      <div>
        <p className="px-3 py-2 text-[11px] font-semibold tracking-widest uppercase text-[#71717A]">Stages</p>
        <div className="space-y-1">
          {STAGE_ORDER.map((key) => {
            const Icon = STAGE_ICONS[key];
            const done = completed.has(key);
            const active = isActive(key);
            return (
              <Link
                key={key}
                href={projectId ? `/workspace/${projectId}?s=${key}` : `/workspace/${key}`}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "text-white border border-[#8B3DFF]/30"
                    : done
                    ? "bg-[#121316] border border-white/[0.06] text-[#A1A1AA] hover:border-white/[0.08] hover:text-white"
                    : "text-[#71717A] hover:bg-white/[0.04] hover:text-[#A1A1AA]"
                }`}
                style={active ? { background: 'linear-gradient(135deg, rgba(139,61,255,0.18), rgba(168,85,247,0.12))', boxShadow: '0 0 20px rgba(139,61,255,0.15)' } : undefined}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                    active ? "bg-[#8B3DFF]/20 border-[#8B3DFF]/30" : done ? "bg-[#2FD3A5]/10 border-[#2FD3A5]/20" : "bg-white/[0.04] border-white/[0.06]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-[#C084FC]" : done ? "text-[#2FD3A5]" : "text-[#71717A]"}`} />
                </span>
                <span className={`flex-1 font-medium leading-none ${active ? "text-white" : ""}`}>
                  {STAGE_META[key].short}
                </span>
                <span className={`w-2 h-2 rounded-full shrink-0 ${done ? "bg-[#2FD3A5]" : active ? "bg-[#8B3DFF] animate-pulse" : "bg-white/20"}`} />
              </Link>
            );
          })}
        </div>
        {loading && <p className="px-3 py-2 text-xs text-[#71717A]">Loading progress…</p>}
      </div>

      <div className="px-3 pt-4 border-t border-white/[0.06]">
        <p className="text-xs leading-relaxed text-[#71717A]">
          Each stage feeds the next. The AI proposes — you decide. Nothing is overwritten without your action.
        </p>
      </div>
    </nav>
  );
}

export default function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const params = useParams() as { id?: string };
  const id = params?.id ?? "";
  if (!id) return <div className="min-h-screen bg-[#08090B] text-white">{children}</div>;
  return (
    <ProjectProvider id={id}>
      <ShellInner>{children}</ShellInner>
    </ProjectProvider>
  );
}
