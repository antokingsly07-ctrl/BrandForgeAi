"use client";
import { createContext, useContext, useCallback, useEffect, useState, ReactNode } from "react";
import type { Project } from "@/lib/types";

interface Ctx {
  project: Project | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setProject: (p: Project) => void;
}

const ProjectContext = createContext<Ctx | null>(null);

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be inside ProjectProvider");
  return ctx;
}

export function ProjectProvider({ id, children }: { id: string; children: ReactNode }) {
  const [project, setProjectState] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`/api/projects/${id}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to load project");
      setProjectState(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const setProject = useCallback((p: Project) => setProjectState(p), []);

  return (
    <ProjectContext.Provider value={{ project, loading, error, refresh: fetchProject, setProject }}>
      {children}
    </ProjectContext.Provider>
  );
}
