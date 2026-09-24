// ============================================================
// BrandForge AI — Workspace Layout (with sidebar)
// Provides the shell for all stage pages
// ============================================================
import { ReactNode, Suspense } from 'react';
import WorkspaceShell from './WorkspaceShell';

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <WorkspaceShell>
      <Suspense fallback={<WorkspaceSkeleton />}>
        {children}
      </Suspense>
    </WorkspaceShell>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <aside className="w-64 bg-white border-r border-ink-100 p-4 animate-pulse">
        <div className="h-8 bg-ink-100 rounded mb-6" />
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => <div key={i} className="h-10 bg-ink-100 rounded" />)}
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 bg-ink-100 rounded w-3/4" />
          <div className="h-4 bg-ink-100 rounded w-1/2" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-40 bg-ink-100 rounded" />
            <div className="h-40 bg-ink-100 rounded" />
          </div>
          <div className="h-40 bg-ink-100 rounded" />
        </div>
      </main>
      <aside className="w-80 bg-white border-l border-ink-100 p-4 animate-pulse hidden lg:block">
        <div className="h-8 bg-ink-100 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-ink-100 rounded" />)}
        </div>
      </aside>
    </div>
  );
}