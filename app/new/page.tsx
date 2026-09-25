"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Lightbulb, Loader2 } from "lucide-react";
import { Reveal, useKeyPressPulse, addRipple, useParallax } from "@/components/animations";

const EXAMPLES = [
  "An AI-powered platform that helps college students find compatible teammates for projects and hackathons.",
  "A calm, minimalist journaling app for anxious professionals who hate noisy productivity tools.",
  "A community marketplace where neighborhood cooks sell home-cooked meals to busy families nearby.",
  "A tool that turns any long article or paper into a visual summary you can actually remember.",
];

export default function NewBrandPage() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ideaRef = useKeyPressPulse();
  const nameRef = useKeyPressPulse();
  useParallax();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idea.trim()) {
      setError("Please describe your idea in a sentence or two.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim(), name: name.trim() || undefined }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to create project");
      router.push(`/workspace/${json.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  async function handleDemo() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo: true, idea: "demo" }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to create demo");
      router.push(`/workspace/${json.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create demo");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F5F5] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] right-[-10%] w-[700px] h-[700px] blob-purple opacity-30" />
        <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] blob-purple-soft opacity-20" />
      </div>

      <nav className="sticky top-0 z-30 bg-[#08090B]/60 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-white">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B3DFF, #A855F7)', boxShadow: '0 2px 12px rgba(139,61,255,0.35)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </span>
            BrandForge AI
          </Link>
          <button onClick={(e) => { addRipple(e as any); handleDemo(); }} disabled={loading} className="key-ripple-container btn-secondary text-sm border-white/[0.06] bg-white/[0.04] text-white hover:bg-white/[0.06]">
            Try demo instead
          </button>
        </div>
      </nav>

      <main className="relative max-w-3xl mx-auto px-4 py-10 sm:py-16">
        <Reveal className="scroll-reveal mb-8">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#C084FC] mb-3">
            <Lightbulb className="w-4 h-4" />
            Start with a rough idea
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            What are you <span className="text-gradient-purple">building?</span>
          </h1>
          <p className="mt-3 text-[#A1A1AA] leading-relaxed">
            One or two sentences is enough — the Discovery agent will pull it apart and ask you anything that is missing before we build the brand. You can be vague. That is the point.
          </p>
        </Reveal>

        <Reveal delay={100} className="scroll-reveal">
        <form onSubmit={handleSubmit} className="card space-y-6 border-white/[0.06] bg-[#121316]">
          <div>
            <label htmlFor="idea" className="label text-[#A1A1AA]">
              Your rough idea <span className="text-[#FF6B6B]">*</span>
            </label>
            <textarea
              ref={ideaRef as any}
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. An app that helps college students find teammates for projects and hackathons…"
              rows={4}
              className="textarea text-base bg-[#18191D] border-white/[0.06] text-white placeholder:text-[#71717A]"
              disabled={loading}
            />
            <p className="mt-2 text-xs text-[#71717A]">Tip: say who it is for and what pain it removes, if you know.</p>
          </div>

          <div>
            <label htmlFor="name" className="label text-[#A1A1AA]">
              Working name <span className="text-[#71717A] font-normal">(optional)</span>
            </label>
            <input
              ref={nameRef as any}
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Leave blank and we'll name it later"
              className="input bg-[#18191D] border-white/[0.06] text-white placeholder:text-[#71717A]"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 text-[#FF8080] px-4 py-3 text-sm">{error}</div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={loading} onClick={addRipple as any} className="key-ripple-container btn-primary flex-1 justify-center py-3">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  Start the brand workflow
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#71717A] mb-3">Try an example</p>
            <div className="grid gap-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={ex}
                  type="button"
                  onClick={(e) => { addRipple(e as any); setIdea(ex); }}
                  disabled={loading}
                  style={{ transitionDelay: `${i * 60}ms` }}
                  className="key-ripple-container text-left px-4 py-3 rounded-xl bg-[#18191D] hover:bg-[#202126] border border-white/[0.06] hover:border-white/[0.08] text-sm text-[#A1A1AA] hover:text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  “{ex}”
                </button>
              ))}
            </div>
          </div>
        </form>
        </Reveal>

        <p className="mt-6 text-center text-xs text-[#71717A]">
          No API key needed — runs in simulated mode. Add your OpenAI-compatible key to <code className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.06] text-[#A1A1AA] font-mono">.env.local</code> for live AI.
        </p>
      </main>
    </div>
  );
}
