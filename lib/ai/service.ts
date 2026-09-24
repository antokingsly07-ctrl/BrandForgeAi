// ============================================================
// BrandForge AI — Provider factory + AI service
// Chooses the real OpenAI-compatible provider when an API key
// is configured (or AI_PROVIDER=openai), otherwise the simulated
// provider. The service layer handles the stage pipeline, prompt
// building, validation, and retries.
// ============================================================
import type { AIProvider, AIRequest, AIResult } from './provider';
import { OpenAIClient, AIHTTPError } from './openai';
import { generateMock } from './mock';
import { buildPrompt, completedStages } from './prompts';
import type { Project, StageKey } from '../types';
import { cleanDiscoveryResult, validateStage, ValidationError } from './validate';

let cachedProvider: AIProvider | null = null;
let cachedMode: 'ai' | 'simulated' | null = null;

function resolveMode(): 'ai' | 'simulated' {
  const env = process.env.AI_PROVIDER?.toLowerCase() ?? 'auto';
  if (env === 'mock') return 'simulated';
  if (env === 'openai' || env === 'nvidia') return 'ai';
  // auto — real AI when any usable key is present
  const cfg = getProviderConfig();
  return cfg.apiKey ? 'ai' : 'simulated';
}

// Provider presets. NVIDIA exposes Nemotron 3.5 Lightning through an
// OpenAI-compatible API (https://integrate.api.nvidia.com/v1), so the same
// /chat/completions client works — only the endpoint, model and key differ.
// Get a key at https://build.nvidia.com (starts with nvapi-).
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const NVIDIA_MODEL = 'nvidia/nemotron-3.5-lightning-30b-a3b';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';
const OPENAI_MODEL = 'gpt-4o-mini';

function isUsableKey(v: string | undefined): v is string {
  const t = (v ?? '').trim();
  return t.length > 0 && t !== 'sk-xxxx' && t !== 'nvapi-xxxx';
}

export interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export function getProviderConfig(): ProviderConfig {
  const provider = process.env.AI_PROVIDER?.toLowerCase() ?? 'auto';
  const openaiKey = (process.env.AI_API_KEY ?? '').trim();
  const nvidiaKey = (process.env.NVIDIA_API_KEY ?? '').trim();
  const wantsNvidia =
    provider === 'nvidia' ||
    (provider !== 'openai' && !isUsableKey(openaiKey) && isUsableKey(nvidiaKey));
  if (wantsNvidia) {
    return {
      apiKey: isUsableKey(openaiKey) ? openaiKey : nvidiaKey,
      baseUrl: (process.env.AI_BASE_URL?.trim() || NVIDIA_BASE_URL).replace(/\/+$/, ''),
      model: process.env.AI_MODEL?.trim() || NVIDIA_MODEL,
    };
  }
  return {
    apiKey: openaiKey,
    baseUrl: (process.env.AI_BASE_URL?.trim() || OPENAI_BASE_URL).replace(/\/+$/, ''),
    model: process.env.AI_MODEL?.trim() || OPENAI_MODEL,
  };
}

export function getProvider(): AIProvider {
  if (cachedProvider && cachedMode === resolveMode()) return cachedProvider;
  const mode = resolveMode();
  if (mode === 'ai') {
    cachedProvider = new OpenAIClient(getProviderConfig());
    cachedMode = 'ai';
  } else {
    // Simulated provider wrapper matching the interface
    cachedProvider = {
      mode: 'simulated',
      label: 'simulated-strategist',
      async generateJSON(req: AIRequest): Promise<AIResult> {
        // The service layer calls the mock directly with full project context
        // This is a fallback; normally we bypass this in aiService.
        return { ok: false, error: 'Simulated provider called directly — use aiService.generateStage' };
      },
    };
    cachedMode = 'simulated';
  }
  return cachedProvider;
}

export function getAIMode(): 'ai' | 'simulated' {
  return resolveMode();
}

export interface GenerateInput {
  project: Project;
  stage: StageKey;
  extra?: { answers?: Record<string, string>; seed?: number; forceMock?: boolean };
}

export interface GenerateOutput {
  ok: boolean;
  data?: unknown;
  error?: string;
  insight?: {
    mode: 'ai' | 'simulated';
    model: string;
    prompt: string;
    reasoning: string[];
    generatedAt: string;
  };
}

export async function generateStage(input: GenerateInput): Promise<GenerateOutput> {
  const { project, stage, extra = {} } = input;
  const mode = extra.forceMock ? 'simulated' : resolveMode();
  const prompt = buildPrompt(stage, project, extra.answers ? { answers: extra.answers } : undefined);

  if (mode === 'simulated') {
    const mock = generateMock(stage, project, { answers: extra.answers, seed: extra.seed });
    if (!mock.ok) return { ok: false, error: (mock as { error?: string }).error ?? 'Simulated generation failed' };
    // Validate mock output the same way we validate real AI output
    try {
      const validated = stage === 'discovery' ? cleanDiscoveryResult(mock.data) : validateStage(stage, mock.data);
      return {
        ok: true,
        data: validated,
        insight: {
          mode: 'simulated',
          model: mock.model,
          prompt: `${prompt.system}\n\nUSER:\n${prompt.user}`,
          reasoning: mock.reasoning,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Simulated output validation failed' };
    }
  }

  // Real AI mode
  const client = getProvider() as OpenAIClient;
  const attempt = async (): Promise<AIResult> =>
    client.generateJSON({ system: prompt.system, user: prompt.user, temperature: 0.7 });

  let result = await attempt();
  if (!result.ok) {
    // One automatic retry on transient errors
    if (result.error?.includes('timeout') || result.error?.includes('network') || result.error?.includes('502') || result.error?.includes('503')) {
      await new Promise((r) => setTimeout(r, 800));
      result = await attempt();
    }
  }
  if (!result.ok) return { ok: false, error: result.error };

  try {
    const validated = stage === 'discovery' ? cleanDiscoveryResult(result.data) : validateStage(stage, result.data);
    return {
      ok: true,
      data: validated,
      insight: {
        mode: 'ai',
        model: result.consumedModel ?? 'unknown',
        prompt: `${prompt.system}\n\nUSER:\n${prompt.user}`,
        reasoning: Array.isArray((result.data as Record<string, unknown>).reasoning)
          ? ((result.data as Record<string, unknown>).reasoning as string[])
          : ['AI-generated — reasoning extracted from response'],
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'AI output validation failed' };
  }
}

export function getCompletedStages(project: Project): StageKey[] {
  return completedStages(project);
}