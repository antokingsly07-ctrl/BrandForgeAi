# BrandForge AI

> **Turn a rough idea into a complete, launch-ready brand system with AI.**

BrandForge AI is a **multi-agent brand intelligence platform** that transforms an incomplete product / startup / community / creator idea into a coherent, usable, launch-ready brand system through a structured 9-stage AI workflow. It is **not a chatbot** — each stage is a specialist agent with structured JSON output that feeds the next stage, with independent critique and consistency checks built in.

**Live demo:** `/demo` loads a fully-worked sample project ("Teampact" — an AI teammate matchmaker for college students) so judges can explore every stage instantly with zero configuration.

---

## Demo flow (30-second judge path)

1. **Landing →** `Build My Brand` or `Try Demo`
2. **New brand →** paste a one-line idea (e.g. *"An app that helps college students find teammates"*) → `Start the brand workflow`
3. **Workspace** opens at **Discover** — the AI extracts structured facts and asks clarifying questions when information is missing. Answer → `Generate discovery`.
4. **Position** — pick one of 3 strategically *different* directions (fit-first / community-first / simplification-first). Selection drives every later stage.
5. **Personality → Naming → Messaging → Visual** — each stage explains *why* decisions fit the audience; edit / regenerate at any time.
6. **Critique** (independent agent) → **Consistency Guardian** → **Launch** (landing, social, product copy).
7. **Brand Kit** — printable 20-section kit with `Print / Save as PDF` and `Copy all`.

No API key required. Without a key the app runs in **Simulated** mode (clearly badged) using a deterministic, strategy-reasoned simulator. Add an OpenAI-compatible key to use live AI.

---

## Features by spec section

| Spec § | Feature | Notes |
|---|---|---|
| 4 | AI Discovery Agent | Extracts 10 structured fields; asks 2–4 clarifying questions when critical info is missing; answers feed back into the extraction |
| 5 | Positioning Agent | 3 distinct directions with competitive angle + fit scores; selection persists |
| 6 | Brand Personality / Shape | Traits + justification, principles, voice examples, tone words |
| 7 | Naming Engine | 5 territories, 9+ names, each with meaning / reasoning / fit / pronunciation / weakness + availability disclaimer |
| 8 | Tagline & Messaging | Taglines, pitches, key messages, CTAs — strictly on-brand from prior stages |
| 9 | Visual Direction | Colored swatches, typography, shape, logo concept, mood — each decision justified |
| 10 | AI Critic | Independent agent; `issue → why → evidence → suggestion` + `Accept / Reject / Apply fix` (apply patches the target field) |
| 11 | Consistency Guardian | Cross-stage check (`aligned / attention / conflicts`) with the same action model |
| 12 | Launch Generator | Landing (hero, features, about) + social (launch, Twitter, LinkedIn, IG) + product messaging |
| 13 | Final Brand Kit | 20 sections, printable, shareable (`/brand-kit/[id]`), copy-all, per-section copy |
| 15 | Human control | Edit, Regenerate, Accept/Reject/Apply, Select, Save progress at every stage |
| 18 | Progress | 0–100% + per-stage status (✓ / ● / ○) in sidebar + top bar |
| 24–25 | Responsive + Accessible | Sidebar → drawer on mobile, cards stack, keyboard-navigable, focus rings, semantic HTML |

---

## Architecture

```
ROUGH IDEA
  → Discover (with Q&A loop)
  → Position (3 directions, user picks)
  → Personality
  → Naming (territories)
  → Messaging
  → Visual
  → Critique (independent)
  → Consistency (independent)
  → Launch
  → Brand Kit (20 sections, printable)

Each stage: structured JSON stored in Project.stages[stage]
            + StageInsight { mode, model, prompt, reasoning, generatedAt }
```

### AI layer

* **Prompt contracts** (`lib/ai/prompts.ts`) — one system+user contract per stage demanding strict JSON + a `reasoning` array so judges see the strategy.
* **Provider abstraction** (`lib/ai/provider.ts`, `openai.ts`, `mock.ts`, `service.ts`) — `AI_PROVIDER=auto|openai|nvidia|mock`. `auto` uses a real OpenAI-compatible endpoint when `AI_API_KEY` is set, NVIDIA Nemotron 3.5 Lightning when only `NVIDIA_API_KEY` is set, otherwise the **simulated provider**.
* **Simulated provider** (`lib/ai/mock.ts`) — deterministic, strategy-reasoned generators for all 9 stages (seeded PRNG for regenerate variation). Clearly labelled in the UI; never disguised as real AI.
* **Validation** (`lib/ai/validate.ts`) — every stage response is validated/normalized before persistence; malformed JSON maps to a friendly retry error.
* **Persistence** — lightweight JSON-file store (`lib/store.ts`, `data/db.json`) with a write-queue. Gives real persistence across reloads without requiring a DB. Swappable for a real DB later.

### API

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/projects` | List projects |
| `POST` | `/api/projects` | Create project `{idea, name?, demo?}` |
| `GET` | `/api/projects/[id]` | Get project |
| `PATCH` | `/api/projects/[id]` | Update `name / activeStage / discoverySession` |
| `DELETE` | `/api/projects/[id]` | Delete project |
| `POST` | `/api/projects/[id]/stage` | Save edited stage data (validated) |
| `POST` | `/api/projects/[id]/apply` | Accept/Reject/Apply for critique/consistency issues (with target patch) |
| `POST` | `/api/ai/[stage]` | Run a single agent stage `{projectId, extra:{answers?, seed?}}` |

Stages: `discovery | positioning | personality | naming | messaging | visual | critique | consistency | launch`

### UI

* **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · lucide-react · next/font (Inter / Space Grotesk / JetBrains Mono)
* **Landing:** hero, 8-step workflow visualization, trust signals, demo teaser
* **Workspace:** sticky header + left sidebar (desktop) / drawer (mobile) + main stage area + insight rail (per-stage reasoning & prompt)
* **Brand Kit:** standalone shareable route (`/brand-kit/[id]`), 20 sections, `window.print()` for PDF export

---

## Tech stack

* **Framework:** Next.js 14.2.x (patched), React 18, TypeScript 5, Tailwind 3
* **Icons:** lucide-react
* **Fonts:** next/font (Inter, Space Grotesk, JetBrains Mono)
* **Runtime store:** `data/db.json` (JSON-file, no external DB required)
* **AI:** OpenAI-compatible HTTP (`/chat/completions`) + simulated fallback

---

## Setup

### Prerequisites

* Node.js 18+ (tested on Node 24 LTS)
* npm

### Install & run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve production build
npm run typecheck # tsc --noEmit (alias for typecheck script if added)
```

### Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `AI_PROVIDER` | no | `auto` | `auto` \| `openai` \| `nvidia` \| `local` \| `mock`. `auto` uses real AI when `AI_API_KEY` is set (or `NVIDIA_API_KEY` for Nemotron), otherwise simulated. |
| `AI_API_KEY` | no | — | OpenAI-compatible API key. Any provider that speaks `/chat/completions` works (OpenAI, OpenRouter, Groq, Together, Azure via `AI_BASE_URL`, local Ollama/LM Studio). Can also hold an `nvapi-` key when `AI_PROVIDER=nvidia`. |
| `NVIDIA_API_KEY` | no | — | NVIDIA key from build.nvidia.com (`nvapi-...`). Used for Nemotron 3.5 Lightning when `AI_PROVIDER=nvidia`, or automatically in `auto` mode if `AI_API_KEY` is unset. |
| `AI_MODEL` | no | `gpt-4o-mini` (`nvidia/nemotron-3.5-lightning-30b-a3b` when NVIDIA is active) | Model ID to request. Leave empty with `AI_PROVIDER=nvidia` for the Nemotron default. |
| `AI_BASE_URL` | no | `https://api.openai.com/v1` | Override for OpenAI-compatible endpoints. |
| `AI_TIMEOUT_MS` | no | `90000` | HTTP timeout in ms. |
| `DATA_DIR` | no | `./data` | Directory for `db.json` persistence. |
| `PORT` | no | `3000` | Port for `next start`. |

**No key?** Leave `AI_API_KEY` empty. The app runs in **Simulated** mode — every stage produces plausible, strategy-reasoned output with a `Simulated` badge so the full workflow is explorable offline and in judging.

---

## Running locally

```bash
npm install
npm run dev
# open http://localhost:3000
# click "Try Demo" or "Build My Brand" → paste an idea → explore the 9 stages → open Brand Kit → Print
```

To use live AI:

```bash
# .env.local
AI_API_KEY=sk-...        # or any OpenAI-compatible key
AI_MODEL=gpt-4o-mini
AI_BASE_URL=              # leave empty for OpenAI, or set to e.g. https://openrouter.ai/api/v1
```

For NVIDIA Nemotron 3.5 Lightning instead:

```bash
# .env.local
AI_PROVIDER=nvidia
NVIDIA_API_KEY=nvapi-...  # from https://build.nvidia.com
# AI_MODEL and AI_BASE_URL can stay empty (defaults to the hosted Lightning model)
```

To run Nemotron 3.5 Lightning **on your own machine** (no cloud, no key):

```bash
# 1. Install Ollama from https://ollama.com
# 2. Pull the model once (~25GB):
npm run ai:pull
# 3. Make sure Ollama is serving: ollama serve
# 4. .env.local:
AI_PROVIDER=local
# AI_MODEL and AI_BASE_URL default to nemotron-3.5-lightning on http://localhost:11434/v1
# Slow hardware? Add: AI_TIMEOUT_MS=300000 and AI_MAX_TOKENS=4000
```

Hardware reality check: the 4-bit model needs ~20GB free RAM/VRAM, so a discrete GPU is strongly recommended — CPU-only works but each stage can take minutes. This only applies to local runs (`npm run dev`); the Vercel deployment can't host the weights and keeps using the hosted API.

Restart `npm run dev`.

---

## Deployment

Any Node host that can run `next build && next start` (Vercel, Fly, Render, Railway, self-hosted). Set the env vars above in the host's dashboard. No DB to provision — `data/db.json` is file-backed; for ephemeral filesystems set `DATA_DIR` to a persistent volume or swap `lib/store.ts` for a DB adapter.

---

## Project structure

```
app/
  layout.tsx, globals.css, page.tsx        # root + landing
  new/page.tsx                              # new brand form
  demo/page.tsx                             # auto-creates demo project + redirects
  workspace/[id]/layout.tsx, WorkspaceShell.tsx, page.tsx  # workspace
  brand-kit/[id]/page.tsx                   # shareable printable kit
  api/projects/route.ts, [id]/route.ts, [id]/stage/route.ts, [id]/apply/route.ts
  api/ai/[stage]/route.ts
components/workspace/ProjectContext.tsx
lib/
  types.ts, utils.ts, store.ts, demoProject.ts
  ai/prompts.ts, validate.ts, provider.ts, openai.ts, mock.ts, service.ts
data/db.json                                # runtime persistence (gitignored)
```

---

## Testing

Manual verification checklist (run after `npm run build`):

* Landing loads, `Build My Brand` + `Try Demo` navigate correctly
* New brand form: validation, example ideas, demo creation
* Discovery: generates, shows Q&A loop, accepts answers, edits persist
* Each subsequent stage: generates, cards render, select/edit/regenerate work, insight rail shows reasoning + prompt
* Critique / Consistency: `Accept / Reject / Apply fix` updates issue status and patches target stage field
* Launch: landing + social + product copy render with copy buttons
* Brand Kit: 20 sections render, `Print / Save as PDF` triggers print, `Copy all` copies text
* Mobile: sidebar becomes drawer, cards stack, pillars remain accessible
* Refresh: project persists across reloads (file store)
* Error states: invalid API key / timeout shows retryable error, not a crash

---

## Notes on AI usage honesty

* The **simulated provider** is clearly badged `Simulated` wherever it appears (stage insight rail, brand kit, etc.).
* No domain or trademark availability is ever claimed — every name carries the disclaimer `No automatic domain/trademark verification performed.`

---
