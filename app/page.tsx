// ============================================================
// BrandForge AI — Landing Page (Dark Premium) with scroll & key animations
// ============================================================
"use client";
import Link from 'next/link';
import { ArrowRight, Sparkles, Target, Pen, Palette, Gavel, Scale, Rocket, CheckCircle, ChevronRight } from 'lucide-react';
import { Reveal, useParallax, addRipple } from '@/components/animations';

const STEPS = [
  { key: 'discover', icon: Sparkles, title: 'Discover', desc: 'AI extracts strategy from your rough idea — and asks clarifying questions when information is missing.' },
  { key: 'position', icon: Target, title: 'Position', desc: '3 distinct strategic directions with fit scores. You pick the angle that steers every later stage.' },
  { key: 'personality', icon: Sparkles, title: 'Personality', desc: 'Traits, voice, principles — all justified against your audience, not picked from a list.' },
  { key: 'naming', icon: Pen, title: 'Naming', desc: 'Names generated in territories (abstract, metaphorical, descriptive…), each with meaning, fit and weaknesses.' },
  { key: 'visual', icon: Palette, title: 'Visuals', desc: 'A structured visual brief — colors, type, logo concept — every decision explained against the strategy.' },
  { key: 'critique', icon: Gavel, title: 'Critique', desc: 'An independent AI critic challenges every prior stage — spotting clichés, contradictions and audience mismatch.' },
  { key: 'consistency', icon: Scale, title: 'Consistency', desc: 'Checks whether name, voice, visuals and launch copy feel like ONE brand. Flags conflicts with corrections.' },
  { key: 'launch', icon: Rocket, title: 'Launch', desc: 'Landing copy, social posts, app descriptions — all on-brand and ready to ship.' },
];

export default function LandingPage() {
  useParallax();
  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F5F5] relative overflow-hidden">
      {/* ambient background blobs - parallax */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -right-[15%] w-[900px] h-[900px] blob-purple opacity-40" />
        <div className="absolute top-[10%] -left-[20%] w-[700px] h-[700px] blob-purple-soft opacity-30" />
        <div className="absolute bottom-[5%] left-[30%] w-[600px] h-[600px] blob-purple-soft opacity-15" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#08090B]/60 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[64px]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B3DFF 0%, #A855F7 100%)', boxShadow: '0 2px 12px rgba(139,61,255,0.4)' }}>
                <Sparkles className="w-[18px] h-[18px] text-white" />
              </div>
              <span className="font-display font-bold text-[18px] tracking-tight text-white">BrandForge AI</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/demo" onClick={addRipple as any} className="key-ripple-container hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[#A1A1AA] hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.06] transition-colors">
                Try Demo
              </Link>
              <Link href="/new" onClick={addRipple as any} className="key-ripple-container inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all" style={{ background: 'linear-gradient(135deg, #8B3DFF 0%, #A855F7 100%)', boxShadow: '0 2px 12px rgba(139,61,255,0.35)' }}>
                Build My Brand
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero - premium dark container */}
      <section className="relative pt-[96px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1220px] mx-auto">
          <div className="relative rounded-[28px] border border-white/[0.06] bg-[#0B0C0F] overflow-hidden">
            <div className="absolute inset-0 rounded-[28px] pointer-events-none" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }} />
            <div className="absolute -right-[10%] top-[5%] w-[720px] h-[720px] blob-purple opacity-25 pointer-events-none" />
            <div className="absolute right-[5%] top-[20%] w-[420px] h-[420px] rounded-full opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,61,255,0.35) 0%, rgba(168,85,247,0.18) 40%, transparent 70%)', filter: 'blur(20px)' }} />

            <div className="relative grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-6 items-center p-6 sm:p-8 lg:p-10">
              {/* Left - copy */}
              <Reveal className="scroll-reveal relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.06] text-[#C084FC] px-3.5 py-1.5 rounded-full text-xs font-medium mb-6 animate-float">
                  <span className="w-2 h-2 rounded-full bg-[#8B3DFF] animate-pulse" />
                  Multi-agent AI brand strategist — not a chatbot
                </div>
                <h1 className="font-display text-[34px] sm:text-[44px] lg:text-[52px] font-bold leading-[0.95] tracking-[-0.03em] text-white">
                  Turn your idea into a
                  <br />
                  <span className="text-gradient-purple">brand people</span>
                  <br />
                  <span className="text-gradient-purple">remember</span>
                </h1>
                <p className="mt-5 text-[15px] sm:text-[16px] leading-[1.6] text-[#A1A1AA] max-w-[520px]">
                  BrandForge AI runs a structured 9-stage workflow — Discover → Position → Shape → Name → Message → Visualize → Critique → Consistency → Launch. Every stage produces structured, editable output that feeds the next.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link href="/new" onClick={addRipple as any} className="key-ripple-container inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white w-full sm:w-auto" style={{ background: 'linear-gradient(135deg, #8B3DFF 0%, #A855F7 100%)', boxShadow: '0 4px 20px rgba(139,61,255,0.4)' }}>
                    Start Building Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/demo" onClick={addRipple as any} className="key-ripple-container inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold bg-[#18191D] border border-white/[0.06] text-white hover:bg-[#202126] hover:border-white/[0.08] w-full sm:w-auto transition-colors">
                    Try the Demo Project
                  </Link>
                </div>
                <p className="mt-4 text-xs text-[#71717A]">No API key required — runs in simulated mode instantly.</p>
              </Reveal>

              {/* Right - abstract visual / product preview */}
              <Reveal delay={150} className="scroll-reveal relative lg:pl-4">
                <div className="relative rounded-[20px] border border-white/[0.06] bg-[#121316] overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), 0 0 40px rgba(139,61,255,0.12)' }}>
                  <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-[#0B0C0F]">
                    <span className="w-3 h-3 rounded-full bg-white/10" />
                    <span className="w-3 h-3 rounded-full bg-white/10" />
                    <span className="w-3 h-3 rounded-full bg-white/10" />
                    <span className="ml-3 text-xs font-mono text-[#71717A]">brandforge.ai · workspace</span>
                  </div>
                  <div className="relative p-5 sm:p-6">
                    <div className="absolute right-6 top-6 w-[180px] h-[180px] rounded-[32px] opacity-60 animate-float" style={{ background: 'linear-gradient(135deg, #8B3DFF 0%, #A855F7 60%, #C084FC 100%)', filter: 'blur(1px)', transform: 'rotate(12deg)', boxShadow: '0 20px 40px rgba(139,61,255,0.4)', animationDelay: '0.5s' }} />
                    <div className="absolute right-[44px] top-[44px] w-[120px] h-[120px] rounded-[24px] bg-white/10 backdrop-blur-xl border border-white/20 animate-float" style={{ transform: 'rotate(-6deg)', animationDelay: '1s' }} />
                    <div className="relative z-10 space-y-3 max-w-[280px]">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #8B3DFF, #A855F7)' }}>✦</span>
                        <span className="text-xs font-display font-semibold text-white tracking-widest uppercase">Discovery</span>
                        <span className="text-xs font-mono text-white/80"> · 82%</span>
                      </div>
                      <div className="h-2.5 w-3/4 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full w-[82%] rounded-full animate-[shimmer_2s_linear_infinite]" style={{ background: 'linear-gradient(90deg, #8B3DFF, #A855F7)' }} />
                      </div>
                      <div className="space-y-2 pt-2">
                        <div className="h-3 w-full rounded bg-white/10 animate-pulse" />
                        <div className="h-3 w-5/6 rounded bg-white/10 animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="h-3 w-4/6 rounded bg-white/[0.06] animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#8B3DFF] text-white">Position</span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70 border border-white/10">Personality</span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-white/50">Naming</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-[#18191D] border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs text-[#71717A]">9 agents · structured output</span>
                    <span className="text-xs font-medium text-[#C084FC]">→ Live preview</span>
                  </div>
                </div>
                <div className="absolute -bottom-3 -left-3 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#18191D] border border-white/[0.08] shadow-xl animate-float" style={{ animationDelay: '1.2s' }}>
                  <span className="w-2 h-2 rounded-full bg-[#2FD3A5] animate-pulse" />
                  <span className="text-xs font-medium text-white">Simulated mode · no key needed</span>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Workflow pills - staggered scroll reveal */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {STEPS.map((step, i) => (
              <Reveal key={step.key} delay={i * 60} className="scroll-reveal">
                <div className="group relative rounded-2xl border border-white/[0.06] bg-[#121316] p-4 hover:border-white/[0.08] hover:bg-[#18191D] transition-all duration-300 hover:-translate-y-1 h-full key-ripple-container" onClick={addRipple as any}>
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'radial-gradient(300px circle at 50% 0%, rgba(139,61,255,0.08), transparent 60%)' }} />
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 border border-[#8B3DFF]/20 group-hover:scale-110 transition-transform duration-300" style={{ background: 'rgba(139,61,255,0.12)' }}>
                      <step.icon className="w-4 h-4 text-[#C084FC] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-display font-semibold text-sm text-white tracking-tight">{step.title}</h3>
                    <p className="text-xs leading-relaxed text-[#71717A] mt-1 line-clamp-3">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Trust signals */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { v: '9', l: 'AI Agents' },
              { v: '100%', l: 'Structured Output' },
              { v: '∞', l: 'Regenerations' },
              { v: '0', l: 'Hardcoded Secrets' },
            ].map((s, i) => (
              <Reveal key={s.l} delay={i * 80} className="scroll-reveal">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 text-center hover:bg-white/[0.04] hover:border-white/[0.08] transition-all hover:scale-[1.02] key-ripple-container" onClick={addRipple as any}>
                  <div className="font-display text-2xl font-bold text-white">{s.v}</div>
                  <div className="text-xs text-[#71717A] mt-1">{s.l}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1220px] mx-auto">
          <Reveal className="scroll-reveal text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-display text-[30px] sm:text-[36px] font-bold tracking-tight text-white">
              An <span className="text-gradient-purple">intelligent</span> workflow, not a single prompt
            </h2>
            <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-[#A1A1AA]">
              Most AI tools give you one giant response. BrandForge AI runs specialist agents in sequence — each with its own role, context from prior stages, and a critic that challenges the work.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'Human-in-the-loop', desc: 'Edit, regenerate, accept or reject at every stage. The AI proposes — you decide. Nothing is overwritten without your action.', icon: CheckCircle },
              { title: 'Context-aware pipeline', desc: 'Each agent receives the full structured context from previous stages. Naming knows your positioning. Messaging knows your name and personality.', icon: Target },
              { title: 'Self-critique built in', desc: "The Critic and Consistency agents are independent — they don't generate, they evaluate. They catch what the creators miss.", icon: Gavel },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 120} className="scroll-reveal">
                <div className="rounded-[18px] border border-white/[0.06] bg-[#121316] p-6 hover:border-white/[0.08] hover:bg-[#18191D] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] group h-full key-ripple-container" onClick={addRipple as any}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-[#8B3DFF]/15 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" style={{ background: 'rgba(139,61,255,0.1)' }}>
                    <item.icon className="w-5 h-5 text-[#C084FC] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-display font-semibold text-white tracking-tight">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-[#A1A1AA] mt-2">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Demo teaser */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-[1220px] mx-auto">
          <Reveal className="scroll-reveal">
            <div className="relative rounded-[28px] border border-white/[0.06] bg-[#0B0C0F] overflow-hidden p-6 sm:p-8 lg:p-10 hover:border-white/[0.08] transition-colors group">
              <div className="absolute -right-[15%] top-[10%] w-[520px] h-[520px] blob-purple opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity" />
              <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
                <div>
                  <h2 className="font-display text-[26px] sm:text-[30px] font-bold tracking-tight text-white">
                    See it work in <span className="text-gradient-purple">30 seconds</span>
                  </h2>
                  <p className="text-sm leading-relaxed text-[#A1A1AA] mt-3 max-w-[520px]">
                    The demo project “Teampact” — an AI teammate matchmaker for college students — shows every stage fully worked: discovery, 3 positioning directions, personality, 15 names across 5 territories, visual brief, AI critique, consistency check, and launch assets.
                  </p>
                  <Link href="/demo" onClick={addRipple as any} className="key-ripple-container inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #8B3DFF 0%, #A855F7 100%)', boxShadow: '0 4px 20px rgba(139,61,255,0.4)' }}>
                    Open Demo Project
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="relative hidden lg:block h-[220px] rounded-2xl border border-white/[0.06] bg-[#121316] overflow-hidden group-hover:border-white/[0.08] transition-colors">
                  <div className="absolute inset-0" style={{ background: 'radial-gradient(600px circle at 30% 20%, rgba(139,61,255,0.25), transparent 60%), radial-gradient(500px circle at 80% 80%, rgba(192,132,252,0.18), transparent 60%)' }} />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[120px] rounded-[40px] animate-float" style={{ background: 'linear-gradient(135deg, #8B3DFF 0%, #A855F7 50%, #C084FC 100%)', filter: 'blur(0.5px)', transform: 'translate(-50%, -50%) rotate(-8deg)', boxShadow: '0 20px 40px rgba(139,61,255,0.35)' }} />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[80px] rounded-[24px] bg-white/10 backdrop-blur-xl border border-white/20 animate-float" style={{ transform: 'translate(-50%, -50%) rotate(6deg)', animationDelay: '0.8s' }} />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="px-2 py-1 rounded-full bg-white/10 text-white/70 border border-white/10">15 names · 5 territories</span>
                    <span className="px-2 py-1 rounded-full bg-[#8B3DFF] text-white">Brand Kit →</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#08090B]">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B3DFF, #A855F7)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white">BrandForge AI</span>
          </div>
          <p className="text-xs text-[#71717A] text-center">Built for hackathons — runs locally with zero config. Add your API key for production AI.</p>
        </div>
      </footer>
    </div>
  );
}
