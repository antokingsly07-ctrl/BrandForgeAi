// ============================================================
// BrandForge AI — per-stage output validation
// Protects the pipeline from malformed / empty / unexpected AI
// responses. Every stage validator returns a "clean" payload or
// throws a ValidationError that the API layer maps to a friendly
// "something went wrong — retry" message.
// ============================================================
import type {
  Discovery,
  Positioning,
  Personality,
  Naming,
  Messaging,
  Visual,
  Critique,
  ConsistencyReport,
  Launch,
  DiscoveryAIResult,
} from '../types';

export class ValidationError extends Error {
  constructor(message: string, public stage?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

function isStr(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter(isStr) : [];
}

export function cleanDiscovery(raw: Discovery): Discovery {
  if (!raw || typeof raw !== 'object') throw new ValidationError('Discovery result is not an object', 'discovery');
  if (!isStr(raw.coreIdea)) throw new ValidationError('Discovery missing coreIdea', 'discovery');
  return {
    coreIdea: raw.coreIdea.trim(),
    problemSolved: isStr(raw.problemSolved) ? raw.problemSolved : '',
    targetAudience: isStr(raw.targetAudience) ? raw.targetAudience : '',
    userNeeds: strArr(raw.userNeeds),
    context: isStr(raw.context) ? raw.context : '',
    goals: strArr(raw.goals),
    constraints: strArr(raw.constraints),
    potentialValue: isStr(raw.potentialValue) ? raw.potentialValue : '',
    openQuestions: strArr(raw.openQuestions),
    assumptions: strArr(raw.assumptions),
  };
}

export function cleanDiscoveryResult(raw: unknown): DiscoveryAIResult {
  const r = (raw ?? {}) as DiscoveryAIResult;
  if (r.needsClarification) {
    const questions = Array.isArray(r.questions)
      ? r.questions
          .filter((q) => q && isStr(q.question))
          .map((q, i) => ({
            id: isStr(q.id) ? q.id : `q_${i}`,
            question: q.question.trim(),
            why: isStr(q.why) ? q.why : '',
            options: Array.isArray(q.options) ? q.options.filter(isStr) : undefined,
            answer: isStr(q.answer) ? q.answer : undefined,
          }))
      : [];
    return { needsClarification: true, questions };
  }
  return { needsClarification: false, discovery: cleanDiscovery(r.discovery as Discovery) };
}

function clampScore(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? Math.round(v) : fallback;
  return Math.min(100, Math.max(0, n));
}

export function cleanPositioning(raw: Positioning): Positioning {
  if (!raw || typeof raw !== 'object') throw new ValidationError('Positioning result is not an object', 'positioning');
  const dirs = Array.isArray(raw.directions) ? raw.directions : [];
  if (dirs.length === 0) throw new ValidationError('Positioning produced no directions', 'positioning');
  const directions = dirs
    .filter((d) => d && isStr(d.name))
    .map((d, i) => ({
      id: isStr(d.id) ? d.id : `dir_${i}`,
      name: d.name.trim(),
      angle: isStr(d.angle) ? d.angle : '',
      summary: isStr(d.summary) ? d.summary : '',
      why: isStr(d.why) ? d.why : '',
      productCategory: isStr(d.productCategory) ? d.productCategory : '',
      targetAudience: isStr(d.targetAudience) ? d.targetAudience : '',
      primaryProblem: isStr(d.primaryProblem) ? d.primaryProblem : '',
      secondaryProblems: strArr(d.secondaryProblems),
      valueProposition: isStr(d.valueProposition) ? d.valueProposition : '',
      keyDifferentiator: isStr(d.keyDifferentiator) ? d.keyDifferentiator : '',
      competitiveAngle: isStr(d.competitiveAngle) ? d.competitiveAngle : '',
      reasonsToBelieve: strArr(d.reasonsToBelieve),
      positioningStatement: isStr(d.positioningStatement) ? d.positioningStatement : '',
      fit: {
        audience: clampScore(d.fit?.audience, 3),
        differentiation: clampScore(d.fit?.differentiation, 3),
        clarity: clampScore(d.fit?.clarity, 3),
      },
    }));
  if (directions.length < 2) throw new ValidationError('Positioning must produce at least 2 directions', 'positioning');
  return { directions, selectedDirectionId: isStr(raw.selectedDirectionId) ? raw.selectedDirectionId : null };
}

export function cleanPersonality(raw: Personality): Personality {
  if (!raw || typeof raw !== 'object') throw new ValidationError('Personality result is not an object', 'personality');
  const traits = Array.isArray(raw.traits)
    ? raw.traits.filter((t) => t && isStr(t.trait)).map((t) => ({ trait: t.trait.trim(), explanation: isStr(t.explanation) ? t.explanation : '' }))
    : [];
  if (traits.length === 0) throw new ValidationError('Personality produced no traits', 'personality');
  return {
    traits,
    traitsToAvoid: strArr(raw.traitsToAvoid),
    principles: strArr(raw.principles),
    emotionalCharacteristics: strArr(raw.emotionalCharacteristics),
    communicationStyle: isStr(raw.communicationStyle) ? raw.communicationStyle : '',
    voice: Array.isArray(raw.voice)
      ? raw.voice.filter((v) => v && isStr(v.characteristic)).map((v) => ({ characteristic: v.characteristic.trim(), example: isStr(v.example) ? v.example : '' }))
      : [],
    toneWords: strArr(raw.toneWords),
    justification: isStr(raw.justification) ? raw.justification : '',
  };
}

export function cleanNaming(raw: Naming): Naming {
  if (!raw || typeof raw !== 'object') throw new ValidationError('Naming result is not an object', 'naming');
  const options = Array.isArray(raw.options)
    ? raw.options
        .filter((o) => o && isStr(o.name))
        .map((o, i) => ({
          id: isStr(o.id) ? o.id : `name_${i}`,
          name: o.name.trim(),
          territory: isStr(o.territory) ? o.territory : 'Other',
          meaning: isStr(o.meaning) ? o.meaning : '',
          reasoning: isStr(o.reasoning) ? o.reasoning : '',
          brandFit: isStr(o.brandFit) ? o.brandFit : '',
          pronunciation: isStr(o.pronunciation) ? o.pronunciation : '',
          personalityFit: isStr(o.personalityFit) ? o.personalityFit : '',
          weakness: isStr(o.weakness) ? o.weakness : '',
          availabilityNote: isStr(o.availabilityNote) ? o.availabilityNote : 'No automatic domain/trademark verification performed.',
        }))
    : [];
  if (options.length === 0) throw new ValidationError('Naming produced no names', 'naming');
  return {
    territories: strArr(raw.territories),
    options,
    shortlisted: strArr(raw.shortlisted),
    selectedId: isStr(raw.selectedId) ? raw.selectedId : null,
    whyThisName: isStr(raw.whyThisName) ? raw.whyThisName : '',
  };
}

export function cleanMessaging(raw: Messaging): Messaging {
  if (!raw || typeof raw !== 'object') throw new ValidationError('Messaging result is not an object', 'messaging');
  if (!isStr(raw.oneLinePitch)) throw new ValidationError('Messaging missing oneLinePitch', 'messaging');
  return {
    taglines: strArr(raw.taglines),
    selectedTagline: isStr(raw.selectedTagline) ? raw.selectedTagline : null,
    oneLinePitch: raw.oneLinePitch.trim(),
    elevatorPitch: isStr(raw.elevatorPitch) ? raw.elevatorPitch : '',
    valuePropositionStatement: isStr(raw.valuePropositionStatement) ? raw.valuePropositionStatement : '',
    keyMessage: isStr(raw.keyMessage) ? raw.keyMessage : '',
    supportingMessages: strArr(raw.supportingMessages),
    ctas: strArr(raw.ctas),
    rationale: isStr(raw.rationale) ? raw.rationale : '',
  };
}

export function cleanVisual(raw: Visual): Visual {
  if (!raw || typeof raw !== 'object') throw new ValidationError('Visual result is not an object', 'visual');
  if (!isStr(raw.concept)) throw new ValidationError('Visual missing concept', 'visual');
  return {
    concept: raw.concept.trim(),
    conceptWhy: isStr(raw.conceptWhy) ? raw.conceptWhy : '',
    colorDirection: isStr(raw.colorDirection) ? raw.colorDirection : '',
    primaryColors: Array.isArray(raw.primaryColors)
      ? raw.primaryColors.filter((c) => c && isStr(c.hex)).map((c) => ({ hex: c.hex.trim(), role: isStr(c.role) ? c.role : '', why: isStr(c.why) ? c.why : '' }))
      : [],
    secondaryColors: Array.isArray(raw.secondaryColors)
      ? raw.secondaryColors.filter((c) => c && isStr(c.hex)).map((c) => ({ hex: c.hex.trim(), role: isStr(c.role) ? c.role : '', why: isStr(c.why) ? c.why : '' }))
      : [],
    typographyDirection: isStr(raw.typographyDirection) ? raw.typographyDirection : '',
    fonts: Array.isArray(raw.fonts)
      ? raw.fonts.filter((f) => f && isStr(f.name)).map((f) => ({ role: isStr(f.role) ? f.role : '', name: f.name.trim(), why: isStr(f.why) ? f.why : '' }))
      : [],
    shapeLanguage: isStr(raw.shapeLanguage) ? raw.shapeLanguage : '',
    imageryStyle: isStr(raw.imageryStyle) ? raw.imageryStyle : '',
    iconography: isStr(raw.iconography) ? raw.iconography : '',
    logoConcept: isStr(raw.logoConcept) ? raw.logoConcept : '',
    compositionStyle: isStr(raw.compositionStyle) ? raw.compositionStyle : '',
    mood: isStr(raw.mood) ? raw.mood : '',
    avoid: strArr(raw.avoid),
    whyFitsAudience: isStr(raw.whyFitsAudience) ? raw.whyFitsAudience : '',
  };
}

function cleanSeverity(v: unknown): 'low' | 'medium' | 'high' {
  return v === 'high' ? 'high' : v === 'low' ? 'low' : 'medium';
}

export function cleanCritique(raw: Critique): Critique {
  if (!raw || typeof raw !== 'object') throw new ValidationError('Critique result is not an object', 'critique');
  const issues = Array.isArray(raw.issues)
    ? raw.issues
        .filter((i) => i && isStr(i.issue))
        .map((i, idx) => ({
          id: isStr(i.id) ? i.id : `issue_${idx}`,
          type: isStr(i.type) ? i.type : 'Observation',
          issue: i.issue.trim(),
          whyProblem: isStr(i.whyProblem) ? i.whyProblem : '',
          evidence: isStr(i.evidence) ? i.evidence : '',
          suggestion: isStr(i.suggestion) ? i.suggestion : '',
          severity: cleanSeverity(i.severity),
          status: 'open' as const,
          target: i.target && typeof i.target === 'object' ? { stage: i.target.stage, path: i.target.path, value: isStr(i.target.value) ? i.target.value : '', label: isStr(i.target.label) ? i.target.label : undefined } : undefined,
        }))
    : [];
  return { summary: isStr(raw.summary) ? raw.summary : '', score: clampScore(raw.score, 70), strengths: strArr(raw.strengths), issues };
}

export function cleanConsistency(raw: ConsistencyReport): ConsistencyReport {
  if (!raw || typeof raw !== 'object') throw new ValidationError('Consistency result is not an object', 'consistency');
  const conflicts = Array.isArray(raw.conflicts)
    ? raw.conflicts
        .filter((c) => c && isStr(c.conflict))
        .map((c, idx) => ({
          id: isStr(c.id) ? c.id : `conflict_${idx}`,
          components: strArr(c.components),
          conflict: c.conflict.trim(),
          explanation: isStr(c.explanation) ? c.explanation : '',
          correction: isStr(c.correction) ? c.correction : '',
          severity: cleanSeverity(c.severity),
          status: 'open' as const,
          target: c.target && typeof c.target === 'object' ? { stage: c.target.stage, path: c.target.path, value: isStr(c.target.value) ? c.target.value : '', label: isStr(c.target.label) ? c.target.label : undefined } : undefined,
        }))
    : [];
  const status: ConsistencyReport['status'] = raw.status === 'aligned' || raw.status === 'attention' ? raw.status : 'conflicts';
  return { status, score: clampScore(raw.score, 80), summary: isStr(raw.summary) ? raw.summary : '', strengths: strArr(raw.strengths), conflicts };
}

export function cleanLaunch(raw: Launch): Launch {
  if (!raw || typeof raw !== 'object') throw new ValidationError('Launch result is not an object', 'launch');
  const landing = raw.landing ?? ({} as Launch['landing']);
  if (!isStr(landing.heroHeadline)) throw new ValidationError('Launch missing hero headline', 'launch');
  return {
    landing: {
      heroHeadline: landing.heroHeadline.trim(),
      subheadline: isStr(landing.subheadline) ? landing.subheadline : '',
      cta: isStr(landing.cta) ? landing.cta : 'Get started',
      features: Array.isArray(landing.features)
        ? landing.features.filter((f) => f && isStr(f.title)).map((f) => ({ title: f.title.trim(), description: isStr(f.description) ? f.description : '' }))
        : [],
      about: isStr(landing.about) ? landing.about : '',
    },
    social: {
      launchPost: isStr(raw.social?.launchPost) ? raw.social.launchPost : '',
      shortAnnouncement: isStr(raw.social?.shortAnnouncement) ? raw.social.shortAnnouncement : '',
      twitter: isStr(raw.social?.twitter) ? raw.social.twitter : '',
      linkedin: isStr(raw.social?.linkedin) ? raw.social.linkedin : '',
      instagram: isStr(raw.social?.instagram) ? raw.social.instagram : '',
    },
    productMessaging: {
      appDescription: isStr(raw.productMessaging?.appDescription) ? raw.productMessaging.appDescription : '',
      shortDescription: isStr(raw.productMessaging?.shortDescription) ? raw.productMessaging.shortDescription : '',
      elevatorPitch: isStr(raw.productMessaging?.elevatorPitch) ? raw.productMessaging.elevatorPitch : '',
      appStoreDescription: isStr(raw.productMessaging?.appStoreDescription) ? raw.productMessaging.appStoreDescription : '',
    },
  };
}

export function validateStage(stage: string, raw: unknown): unknown {
  switch (stage) {
    case 'discovery':
      return cleanDiscovery(raw as Discovery);
    case 'positioning':
      return cleanPositioning(raw as Positioning);
    case 'personality':
      return cleanPersonality(raw as Personality);
    case 'naming':
      return cleanNaming(raw as Naming);
    case 'messaging':
      return cleanMessaging(raw as Messaging);
    case 'visual':
      return cleanVisual(raw as Visual);
    case 'critique':
      return cleanCritique(raw as Critique);
    case 'consistency':
      return cleanConsistency(raw as ConsistencyReport);
    case 'launch':
      return cleanLaunch(raw as Launch);
    default:
      throw new ValidationError(`Unknown stage: ${stage}`, stage);
  }
}

export function cleanFollowUpAnswers(answers: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  if (answers && typeof answers === 'object') {
    for (const [k, v] of Object.entries(answers)) {
      if (isStr(v)) out[k] = v.trim();
    }
  }
  return out;
}