"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";

export default function DemoPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function create() {
      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ demo: true, idea: "demo" }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Failed to create demo");
        if (!cancelled) router.replace(`/workspace/${json.data.id}`);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to create demo");
      }
    }
    create();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#08090B] text-white flex flex-col items-center justify-center px-4 py-16 text-center relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] blob-purple opacity-25" />
      </div>
      <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #8B3DFF, #A855F7)', boxShadow: '0 8px 32px rgba(139,61,255,0.35)' }}>
        <Sparkles className="w-6 h-6 text-white" />
      </div>
      <h1 className="relative font-display text-2xl font-bold text-white">Opening the demo project…</h1>
      <p className="relative mt-2 text-[#A1A1AA] max-w-md">“Teampact” — every stage fully worked so you can explore the workflow instantly.</p>
      {error ? (
        <div className="relative mt-8 card border-[#FF6B6B]/20 bg-[#1F1212] max-w-md w-full text-left">
          <p className="text-sm text-[#FF8080]">{error}</p>
          <Link href="/new" className="btn-primary mt-4">
            Start a new brand instead
          </Link>
        </div>
      ) : (
        <div className="relative mt-8 flex items-center gap-3 text-[#71717A]">
          <Loader2 className="w-5 h-5 animate-spin text-[#8B3DFF]" />
          <span className="text-sm">Creating your demo workspace…</span>
        </div>
      )}
    </div>
  );
}
