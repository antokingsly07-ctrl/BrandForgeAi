// ============================================================
// BrandForge AI — provider interface + runtime factory
// ============================================================
import type { AIRequest as Req } from './provider';

export interface AIRequest {
  system: string;
  user: string;
  temperature?: number;
}

export interface AIResult {
  ok: boolean;
  data?: unknown;
  error?: string;
  consumedModel?: string;
}

export interface AIProvider {
  readonly mode: 'ai' | 'simulated';
  readonly label: string;
  generateJSON(req: AIRequest): Promise<AIResult>;
}

export type { Req as AIRequestInput };