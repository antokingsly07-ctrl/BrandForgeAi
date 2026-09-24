// ============================================================
// BrandForge AI — OpenAI-compatible provider
// Talks to any OpenAI-compatible /chat/completions endpoint
// (OpenAI, OpenRouter, Groq, Together, Azure via base URL,
// local Ollama/LM Studio, etc.). Strict JSON output is requested
// via the system prompt and extracted defensively (fences and
// surrounding prose are stripped). Failures map to structured
// errors the API layer turns into friendly retry messages.
// ============================================================
import type { AIProvider, AIRequest, AIResult } from './provider';

function stripFences(text: string): string {
  const t = text.trim();
  const fenceMatch = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenceMatch) return fenceMatch[1].trim();
  return t;
}

function extractJson(text: string): unknown {
  const cleaned = stripFences(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to find the first balanced {...} block
    const start = cleaned.indexOf('{');
    if (start === -1) throw new Error('No JSON object found in AI response');
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = start; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === '\\') esc = true;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') inStr = true;
      else if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          return JSON.parse(cleaned.slice(start, i + 1));
        }
      }
    }
    throw new Error('Unbalanced JSON in AI response');
  }
}

export class AIHTTPError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'AIHTTPError';
  }
}

export class OpenAIClient implements AIProvider {
  readonly mode = 'ai' as const;
  readonly label: string;

  private baseUrl: string;
  private apiKey: string;
  private model: string;
  private timeoutMs: number;

  constructor(opts: { apiKey?: string; baseUrl?: string; model?: string; timeoutMs?: number }) {
    this.apiKey = opts.apiKey || process.env.AI_API_KEY || '';
    this.model = opts.model || process.env.AI_MODEL || 'gpt-4o-mini';
    this.timeoutMs = opts.timeoutMs ?? (Number(process.env.AI_TIMEOUT_MS) || 90_000);
    const base = opts.baseUrl || process.env.AI_BASE_URL || '';
    this.baseUrl = base ? base.replace(/\/+$/, '') : 'https://api.openai.com/v1';
    this.label = this.model;
  }

  async generateJSON(req: AIRequest): Promise<AIResult> {
    if (!this.apiKey) {
      return { ok: false, error: 'AI_API_KEY is not configured. Add it to .env.local or switch AI_PROVIDER=mock.' };
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          temperature: req.temperature ?? 0.7,
          messages: [
            { role: 'system', content: req.system },
            { role: 'user', content: req.user },
          ],
        }),
        signal: controller.signal,
        cache: 'no-store',
      });
    } catch (e) {
      if ((e as Error).name === 'AbortError') {
        return { ok: false, error: `The AI request timed out after ${Math.round(this.timeoutMs / 1000)}s. Try again.` };
      }
      return { ok: false, error: e instanceof Error ? e.message : 'Network error calling the AI provider.' };
    } finally {
      clearTimeout(timer);
    }

    if (res.status === 429) {
      return { ok: false, error: 'Rate limit hit on the AI provider. Wait a moment and retry.' };
    }
    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: 'AI provider rejected the API key (401/403). Check AI_API_KEY.' };
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `AI provider error (HTTP ${res.status}): ${body.slice(0, 200)}` };
    }

    let json: Record<string, unknown>;
    try {
      json = (await res.json()) as Record<string, unknown>;
    } catch {
      return { ok: false, error: 'Received a malformed response from the AI provider.' };
    }

    const choices = (json as { choices?: Array<{ message?: { content?: string } }> }).choices;
    const content = choices?.[0]?.message?.content as string | undefined;
    if (!content) {
      return { ok: false, error: 'AI provider returned an empty response' };
    }
    try {
      return { ok: true, data: extractJson(content), consumedModel: this.model };
    } catch (e) {
      return { ok: false, error: `AI returned invalid JSON: ${e instanceof Error ? e.message : 'parse error'}` };
    }
  }
}