// ============================================================
// BrandForge AI — shared type definitions
// The AI workflow is modelled as a pipeline of 9 stage agents.
// Each stage produces structured JSON that feeds the next stage.
// ============================================================

export type StageKey =
  | 'discovery'
  | 'positioning'
  | 'personality'
  | 'naming'
  | 'messaging'
  | 'visual'
  | 'critique'
  | 'consistency'
  | 'launch';

export const STAGE_ORDER: StageKey[] = [
  'discovery',
  'positioning',
  'personality',
  'naming',
  'messaging',
  'visual',
  'critique',
  'consistency',
  'launch',
];

export const STAGE_META: Record<StageKey, { title: string; short: string; description: string; icon: string }> = {
  discovery: {
    title: 'Discover & Understand',
    short: 'Discover',
    description: 'Distill the rough idea into structured facts — problem, audience, needs, constraints and open questions. Asks clarifying questions when information is missing.',
    icon: 'search',
  },
  positioning: {
    title: 'Position',
    short: 'Position',
    description: 'Explore 3 distinct strategic directions with a competitive angle for each. You pick the direction that steers every later stage.',
    icon: 'target',
  },
  personality: {
    title: 'Shape the Personality',
    short: 'Personality',
    description: 'Define traits, voice, principles and communication style — all justified against the audience you are trying to reach.',
    icon: 'sparkles',
  },
  naming: {
    title: 'Naming Engine',
    short: 'Naming',
    description: 'Names are generated inside territories (abstract, descriptive, metaphorical…), each with meaning, reasoning, fit and weaknesses.',
    icon: 'pen',
  },
  messaging: {
    title: 'Tagline & Message',
    short: 'Messaging',
    description: 'Taglines, pitches, key messages and CTAs — written from the selected positioning, personality and name.',
    icon: 'message',
  },
  visual: {
    title: 'Visual Direction',
    short: 'Visuals',
    description: 'A structured visual brief — colors, typography, shape, logo concept, mood — each decision explained against the strategy.',
    icon: 'palette',
  },
  critique: {
    title: 'AI Critique',
    short: 'Critique',
    description: 'An independent critic agent challenges every prior stage — spotting clichés, contradictions, weak positioning and audience mismatches.',
    icon: 'gavel',
  },
  consistency: {
    title: 'Consistency Guardian',
    short: 'Consistency',
    description: 'Checks whether name, positioning, personality, messaging and visuals feel like ONE brand. Flags conflicts and suggests corrections.',
    icon: 'scale',
  },
  launch: {
    title: 'Launch Generator',
    short: 'Launch',
    description: 'Practical launch assets: landing page copy, social posts, app description and pitches — all on-brand.',
    icon: 'rocket',
  },
};

// ------------------------------------------------------------
// STAGE 1 — Discovery
// ------------------------------------------------------------
export interface FollowUpQuestion {
  id: string;
  question: string;
  why: string;
  options?: string[];
  answer?: string;
}

export interface Discovery {
  coreIdea: string;
  problemSolved: string;
  targetAudience: string;
  userNeeds: string[];
  context: string;
  goals: string[];
  constraints: string[];
  potentialValue: string;
  openQuestions: string[];
  assumptions: string[];
}

export interface DiscoveryAIResult {
  needsClarification: boolean;
  questions?: FollowUpQuestion[];
  discovery?: Discovery;
}

// ------------------------------------------------------------
// STAGE 2 — Positioning
// ------------------------------------------------------------
export interface FitScores {
  audience: number; // 1-5
  differentiation: number; // 1-5
  clarity: number; // 1-5
}

export interface PositioningDirection {
  id: string;
  name: string;
  angle: string;
  summary: string;
  why: string;
  productCategory: string;
  targetAudience: string;
  primaryProblem: string;
  secondaryProblems: string[];
  valueProposition: string;
  keyDifferentiator: string;
  competitiveAngle: string;
  reasonsToBelieve: string[];
  positioningStatement: string;
  fit: FitScores;
}

export interface Positioning {
  directions: PositioningDirection[];
  selectedDirectionId: string | null;
}

// ------------------------------------------------------------
// STAGE 3 — Personality
// ------------------------------------------------------------
export interface Trait {
  trait: string;
  explanation: string;
}

export interface VoiceExample {
  characteristic: string;
  example: string;
}

export interface Personality {
  traits: Trait[];
  traitsToAvoid: string[];
  principles: string[];
  emotionalCharacteristics: string[];
  communicationStyle: string;
  voice: VoiceExample[];
  toneWords: string[];
  justification: string;
}

// ------------------------------------------------------------
// STAGE 4 — Naming
// ------------------------------------------------------------
export interface NameOption {
  id: string;
  name: string;
  territory: string;
  meaning: string;
  reasoning: string;
  brandFit: string;
  pronunciation: string;
  personalityFit: string;
  weakness: string;
  availabilityNote: string;
}

export interface Naming {
  territories: string[];
  options: NameOption[];
  shortlisted: string[];
  selectedId: string | null;
  whyThisName: string;
}

// ------------------------------------------------------------
// STAGE 5 — Messaging
// ------------------------------------------------------------
export interface Messaging {
  taglines: string[];
  selectedTagline: string | null;
  oneLinePitch: string;
  elevatorPitch: string;
  valuePropositionStatement: string;
  keyMessage: string;
  supportingMessages: string[];
  ctas: string[];
  rationale: string;
}

// ------------------------------------------------------------
// STAGE 6 — Visual
// ------------------------------------------------------------
export interface ColorStop {
  hex: string;
  role: string;
  why: string;
}

export interface FontChoice {
  role: string;
  name: string;
  why: string;
}

export interface Visual {
  concept: string;
  conceptWhy: string;
  colorDirection: string;
  primaryColors: ColorStop[];
  secondaryColors: ColorStop[];
  typographyDirection: string;
  fonts: FontChoice[];
  shapeLanguage: string;
  imageryStyle: string;
  iconography: string;
  logoConcept: string;
  compositionStyle: string;
  mood: string;
  avoid: string[];
  whyFitsAudience: string;
}

// ------------------------------------------------------------
// STAGE 7 — Critique
// ------------------------------------------------------------
export interface CorrectionTarget {
  stage: StageKey;
  path: string; // dot-path into that stage's data
  value: string;
  label?: string;
}

export interface CritiqueIssue {
  id: string;
  type: string;
  issue: string;
  whyProblem: string;
  evidence: string;
  suggestion: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'accepted' | 'rejected' | 'applied';
  target?: CorrectionTarget;
}

export interface Critique {
  summary: string;
  score: number; // 0-100 brand strength
  strengths: string[];
  issues: CritiqueIssue[];
}

// ------------------------------------------------------------
// STAGE 8 — Consistency
// ------------------------------------------------------------
export interface ConsistencyConflict {
  id: string;
  components: string[]; // e.g. ["Naming", "Personality"]
  conflict: string;
  explanation: string;
  correction: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'accepted' | 'rejected' | 'applied';
  target?: CorrectionTarget;
}

export interface ConsistencyReport {
  status: 'aligned' | 'attention' | 'conflicts';
  score: number; // 0-100
  summary: string;
  strengths: string[];
  conflicts: ConsistencyConflict[];
}

// ------------------------------------------------------------
// STAGE 9 — Launch
// ------------------------------------------------------------
export interface LaunchFeature {
  title: string;
  description: string;
}

export interface Launch {
  landing: {
    heroHeadline: string;
    subheadline: string;
    cta: string;
    features: LaunchFeature[];
    about: string;
  };
  social: {
    launchPost: string;
    shortAnnouncement: string;
    twitter: string;
    linkedin: string;
    instagram: string;
  };
  productMessaging: {
    appDescription: string;
    shortDescription: string;
    elevatorPitch: string;
    appStoreDescription: string;
  };
}

// ------------------------------------------------------------
// Stage container + Project
// ------------------------------------------------------------
export interface StageInsight {
  mode: 'ai' | 'simulated';
  model: string;
  prompt: string; // the contract sent to the model
  reasoning: string[]; // why the agent chose what it chose
  generatedAt: string;
}

export interface ProjectStages {
  discovery: Discovery | null;
  positioning: Positioning | null;
  personality: Personality | null;
  naming: Naming | null;
  messaging: Messaging | null;
  visual: Visual | null;
  critique: Critique | null;
  consistency: ConsistencyReport | null;
  launch: Launch | null;
}

export type StageDataMap = {
  discovery: Discovery;
  positioning: Positioning;
  personality: Personality;
  naming: Naming;
  messaging: Messaging;
  visual: Visual;
  critique: Critique;
  consistency: ConsistencyReport;
  launch: Launch;
};

export interface Project {
  id: string;
  name: string;
  idea: string;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
  activeStage: StageKey;
  insights: Partial<Record<StageKey, StageInsight>>;
  discoverySession: {
    questions: FollowUpQuestion[];
    answers: Record<string, string>;
    askedAt: string | null;
  };
  stages: ProjectStages;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}