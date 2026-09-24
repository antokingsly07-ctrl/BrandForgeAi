// ============================================================
// BrandForge AI — Simulated provider (demo / no-API-key mode)
// A deterministic, strategy-reasoned simulator that produces
// plausible structured output for every stage WITHOUT calling an
// LLM. It is explicitly labelled "Simulated" in the UI so it is
// never disguised as real AI — it exists so the full brand
// workflow is explorable with zero configuration (ideal for
// hackathon judging), and to keep the app testable offline.
//
// It performs light text analysis of the idea, builds structured
// context from earlier stages, and applies seeded variation so
// "Regenerate" produces different-but-consistent suggestions.
// ============================================================
import type {
  Project,
  StageKey,
  DiscoveryAIResult,
  Discovery,
  Positioning,
  Personality,
  Naming,
  Messaging,
  Visual,
  Critique,
  ConsistencyReport,
  Launch,
} from '../types';

// ------------------------------------------------------------
// Seeded PRNG (mulberry32) — deterministic variation
// ------------------------------------------------------------
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pick<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)];
}

// ------------------------------------------------------------
// Light idea analysis
// ------------------------------------------------------------
interface IdeaProfile {
  audience: string | null;
  problem: string | null;
  hasDifferentiator: boolean;
  categoryHints: string[];
  tone: 'energetic' | 'calm' | 'playful' | 'serious' | 'technical' | 'warm';
  isStudent: boolean;
}

const AUDIENCE_PATTERNS: Array<[RegExp, string]> = [
  [/student|campus|college|university|hackathon|classmate/i, 'college students'],
  [/developer|engineer|coder|programmer|software/i, 'developers'],
  [/designer|creative/i, 'designers and creatives'],
  [/small business|shop|store owner|freelanc/i, 'small-business owners and freelancers'],
  [/creator|influencer|youtuber|podcast/i, 'content creators'],
  [/parent|family|kid/i, 'parents and families'],
  [/teacher|educator|classroom/i, 'educators'],
  [/artist|musician|band/i, 'artists and musicians'],
  [/gamer|gaming/i, 'gamers'],
  [/startup|founder|entrepreneur/i, 'startup founders'],
  [/health|fitness|wellness/i, 'health-conscious people'],
  [/remote|work from home|team/i, 'distributed teams'],
  [/community|group|club/i, 'community groups'],
  [/senior|retir/i, 'older adults'],
];

const PROBLEM_PATTERNS: Array<[RegExp, string]> = [
  [/find|match|connect|meet/i, 'the struggle to find or connect with the right people, resources or opportunities'],
  [/manage|organize|plan|track|schedule/i, 'the burden of organizing, planning and tracking scattered work'],
  [/save|reduce|cut|cheap|cost|expensive/i, 'the cost and waste of inefficient existing approaches'],
  [/learn|teach|improve|grow|skill/i, 'the difficulty of learning, improving or building skills'],
  [/share|collaborate|team|together/i, 'the friction of collaborating and sharing work with others'],
  [/time|slow|wait|fast/i, 'the time wasted on slow manual processes'],
];

const CATEGORY_HINTS = [
  /app|platform|tool|software|website|web/i,
  /network|marketplace|match|hire|job/i,
  /community|social|group|connect/i,
  /content|media|video|blog|news/i,
  /health|fitness|medical|wellness/i,
  /finance|money|invest|budget/i,
  /education|learn|course|study/i,
];

function analyze(idea: string): IdeaProfile {
  const profile: IdeaProfile = {
    audience: null,
    problem: null,
    hasDifferentiator: /unlike|versus|\bvs\b|better than|because|no more|without|instead of/i.test(idea),
    categoryHints: [],
    tone: 'energetic',
    isStudent: /student|campus|college|university|hackathon|campus/i.test(idea),
  };
  for (const [re, label] of AUDIENCE_PATTERNS) {
    if (re.test(idea)) {
      profile.audience = label;
      break;
    }
  }
  for (const [re, label] of PROBLEM_PATTERNS) {
    if (re.test(idea)) {
      profile.problem = label;
      break;
    }
  }
  for (const re of CATEGORY_HINTS) {
    if (re.test(idea)) profile.categoryHints.push(re.source.slice(1, 20));
  }
  if (/playful|fun|game|kid|meme/i.test(idea)) profile.tone = 'playful';
  else if (/calm|focus|relax|mind/i.test(idea)) profile.tone = 'calm';
  else if (/a[iI]|machine|tech|automation/i.test(idea)) profile.tone = 'technical';
  else if (/serious|enterprise|b2b|corporate|legal/i.test(idea)) profile.tone = 'serious';
  else if (/warm|support|care|help/i.test(idea)) profile.tone = 'warm';
  return profile;
}

function wordWrap(text: string): string {
  return text;
}

// Canned name pool (territory -> options) — crafted for a
// "connect people to outcomes" product family so the simulated
// output always reads intentional.
const NAME_POOL: Array<{
  name: string;
  territory: string;
  meaning: string;
  reasoning: string;
  brandFit: string;
  pronunciation: string;
  personalityFit: string;
  weakness: string;
}> = [
  { name: 'Teampact', territory: 'Abstract names', meaning: 'A portmanteau of “team” and “impact” — a pact made with teammates to build something that matters.', reasoning: 'Names both the people (team) and the outcome (impact); “pact” quietly promises commitment. Distinctive and memorable.', brandFit: 'High — instantly evokes teams and outcomes.', pronunciation: 'TEEM-pact', personalityFit: 'Warm and sharp — a promise, not a buzzword.', weakness: 'Slightly formal tail; needs energetic voice to balance.' },
  { name: 'Synavia', territory: 'Abstract names', meaning: 'Blends “synergy” with “via” — the route from many people to one flowing outcome.', reasoning: 'Smooth modern abstract word implying frictionless coordination.', brandFit: 'Medium — modern but less explicit about the what.', pronunciation: 'sin-AY-vee-uh', personalityFit: 'Energetic and optimistic.', weakness: 'Abstract names need storytelling to communicate function.' },
  { name: 'Veen', territory: 'Abstract names', meaning: 'A coined syllable evoking “seeing” — clear sight of the right connection.', reasoning: 'Two-syllable, brandable, works across languages.', brandFit: 'Medium — strong wordmark, weak semantic link.', pronunciation: 'veen', personalityFit: 'Calm and confident.', weakness: 'Meaning must be taught on first contact.' },
  { name: 'Kindleworks', territory: 'Abstract names', meaning: 'The place where a small spark becomes a finished work.', reasoning: 'Blends ignition (“kindle”) with output (“work”) — matches the “from idea to shipped” arc.', brandFit: 'High — warm + outcome-driven.', pronunciation: 'KIN-dul-wurks', personalityFit: 'Warm and optimistic.', weakness: 'Longer name; wordmark needs tight lockup.' },
  { name: 'MatchUp', territory: 'Descriptive names', meaning: 'The precise action: matching people up into productive pairs or groups.', reasoning: 'Maximum clarity; inherits positive associations of matchmaking culture.', brandFit: 'Very high — full value proposition in one word.', pronunciation: 'MATCH-up', personalityFit: 'Energetic and direct.', weakness: 'Less distinctive; “match” language is common.' },
  { name: 'TeamForge', territory: 'Descriptive names', meaning: 'A forge where raw people and ideas are hammered into a finished team.', reasoning: 'Literal, outcome-focused; implies transformation and hard work.', brandFit: 'High clarity.', pronunciation: 'TEEM-forj', personalityFit: 'Pragmatic, strong, less warm.', weakness: '“*-forge” is a common startup suffix pattern.' },
  { name: 'Commune', territory: 'Descriptive names', meaning: 'A shared space where members build together.', reasoning: 'Simple, human, instantly legible community meaning.', brandFit: 'High for community-first positioning.', pronunciation: 'CAH-myoone', personalityFit: 'Warm and approachable.', weakness: 'Has a historical/political resonance to manage.' },
  { name: 'Quickmatch', territory: 'Descriptive names', meaning: 'Matches made quickly without sacrificing fit.', reasoning: 'Positions speed as a feature while implying quality.', brandFit: 'High for a fast-action audience.', pronunciation: 'kwik-MATCH', personalityFit: 'Energetic, pragmatic.', weakness: 'Slightly generic utility tone.' },
  { name: 'Northbound', territory: 'Metaphorical names', meaning: 'Moving north — the project heading in the right direction as a group.', reasoning: 'Navigation metaphor fits a product that points people toward the right outcome.', brandFit: 'Medium-high: direction + journey imagery.', pronunciation: 'NORTH-bownd', personalityFit: 'Pragmatic and optimistic.', weakness: 'No explicit people/team signal.' },
  { name: 'Foundry', territory: 'Metaphorical names', meaning: 'A foundry pours raw material into useful objects — inputs into shipped work.', reasoning: 'Craftsmanship metaphor implying transformation and effort.', brandFit: 'Medium — serious and strong.', pronunciation: 'FOWN-dree', personalityFit: 'Sharp and pragmatic.', weakness: 'Industrial connotation; less warm.' },
  { name: 'Kindling', territory: 'Metaphorical names', meaning: 'The small dry sticks that start a real fire — the first spark that turns strangers into a burning idea.', reasoning: 'Growth + ignition metaphor; the product is the spark.', brandFit: 'High for warm personalities.', pronunciation: 'KIN-dling', personalityFit: 'Warm, optimistic, energetic.', weakness: 'Less credible for hard-B2B messaging.' },
  { name: 'Compass', territory: 'Metaphorical names', meaning: 'The instrument that finds direction when you are lost in choices.', reasoning: 'Universal metaphor for finding the right path.' , brandFit: 'Medium — strong metaphor, crowded word.', pronunciation: 'KUM-pus', personalityFit: 'Calm and confident.', weakness: 'Heavily used across navigation and mapping products.' },
  { name: 'Tribe', territory: 'Community-oriented names', meaning: 'A tight group of people who look after each other and build together.', reasoning: 'Instant belonging signal; lean and human.', brandFit: 'High — community energy.', pronunciation: 'tryb', personalityFit: 'Warm, direct, optimistic.', weakness: 'Common word; hard to own; mild cultural sensitivity.' },
  { name: 'Circled', territory: 'Community-oriented names', meaning: 'A circle of people drawn together — a team with each other’s back.', reasoning: 'Geometric togetherness with motion (“circled in”).', brandFit: 'Medium-high — social and inclusive.', pronunciation: 'SUR-kuld', personalityFit: 'Warm and approachable.', weakness: '“Circle” is saturated in social products.' },
  { name: 'Overlap', territory: 'Community-oriented names', meaning: 'The exact space where two people’s skills, schedules and goals intersect — the match itself.', reasoning: 'Names the core invention (the intersection) rather than the surface layer.', brandFit: 'High — distinctive and intellectually honest.', pronunciation: 'OH-vur-lap', personalityFit: 'Sharp and pragmatic, warm core.', weakness: 'Sounds slightly technical on first read.' },
  { name: 'Pulse', territory: 'Technology-oriented names', meaning: 'The heartbeat of a project — live status, everyone in rhythm.', reasoning: 'Simple tech-native word implying real-time coordination.', brandFit: 'Medium — modern but generic among SaaS.', pronunciation: 'puls', personalityFit: 'Energetic and sharp.', weakness: 'Saturated across health-tech and dashboards.' },
  { name: 'Second Signal', territory: 'Technology-oriented names', meaning: 'Beyond the first impression — the deeper compatibility signal others miss.', reasoning: 'Positions the algorithm as seeing what simple signups cannot.', brandFit: 'High for algorithm-led products.', pronunciation: 'SEH-kund SIG-nul', personalityFit: 'Sharp, optimistic without hype.', weakness: 'Two words; slower to say and type.' },
  { name: 'NodeCrew', territory: 'Technology-oriented names', meaning: 'A node in the network of your people — a crew formed from the graph.', reasoning: 'Technical + social blend; network imagery suits matching engines.', brandFit: 'Medium-high — tech credibility with a human suffix.', pronunciation: 'nod-KROO', personalityFit: 'Warm and sharp, modern.', weakness: '“Crew” is casual; less professional to institutions.' },
];

interface MockCtx {
  idea: string;
  project: Project | null;
  answers?: Record<string, string>;
  seed?: number;
}

// ------------------------------------------------------------
// Stage generators
// ------------------------------------------------------------
function genDiscovery(ctx: MockCtx): { data: unknown; reasoning: string[] } {
  const idea = ctx.idea.trim() || 'A rough idea that needs structure.';
  const p = analyze(idea);

  // Ask questions when critical information is missing.
  const questions: DiscoveryAIResult['questions'] = [];
  if (!p.audience) {
    questions.push({
      id: 'q_audience',
      question: 'Who is the primary person using this?',
      why: 'Every branding decision downstream — voice, visuals, messaging — depends on knowing exactly who we are speaking to.',
      options: ['College students', 'Professionals', 'Creators', 'Small businesses', 'Everyone'],
    });
  }
  if (!p.problem) {
    questions.push({
      id: 'q_problem',
      question: 'What is the single biggest pain this removes for them?',
      why: 'A brand without a sharp problem is a feature list, not a brand. We need the one sentence people would repeat.',
    });
  }
  if (!p.hasDifferentiator) {
    questions.push({
      id: 'q_diff',
      question: 'What makes this genuinely different from what people already use?',
      why: 'Differentiation is the heart of positioning later. Without it the brand cannot convince anyone to switch.',
      options: ['AI/automation does the heavy lifting', 'It is dramatically simpler', 'It is community-owned', 'It is the first of its kind'],
    });
  }
  questions.push({
    id: 'q_context',
    question: 'Where and when do people hit this problem?',
    why: 'Context shapes everything from launch channels to visual mood — a desk tool and a party product need totally different brands.',
  });

  const needsClarification = questions.length > 0 && (!ctx.answers || Object.keys(ctx.answers).length < 2);
  const answers = ctx.answers ?? {};

  if (needsClarification) {
    return {
      data: { needsClarification: true, questions } satisfies DiscoveryAIResult,
      reasoning: [
        'Critical facts are missing — asking instead of fabricating keeps the strategy honest.',
        `Identified audience${p.audience ? ` (${p.audience})` : ''}${p.problem ? ' and problem' : ''} from the idea text; the rest needs the founder.`,
      ],
    };
  }

  const audience = isStr(answers.q_audience) ? answers.q_audience : (p.audience ?? 'the people facing this problem');
  const problem = isStr(answers.q_problem) ? answers.q_problem : (p.problem ?? 'the friction and wasted effort of the current way of doing things');
  const diff = isStr(answers.q_diff) ? answers.q_diff : 'a fundamentally better approach powered by thoughtful automation';
  const context = isStr(answers.q_context) ? answers.q_context : 'mostly in busy, deadline-driven moments where the old way costs the most time';

  const discovery: Discovery = {
    coreIdea: idea,
    problemSolved: problem,
    targetAudience: audience,
    userNeeds: [
      `A way to solve "${problem}" without the usual overhead and risk`,
      'Clear signals of quality so choices can be trusted quickly',
      'Speed that fits real deadlines — setup in minutes, not days',
      'Control: the ability to review, tweak and decide instead of blindly accepting suggestions',
    ],
    context: context + ' This idea fills a gap because the existing options are manual, scattered or generic.',
    goals: [
      `Shorten the time from "start" to "finished outcome" for ${lowerFirst(audience)}`,
      'Build trust through transparent, explainable decisions',
      'Grow by word of mouth: users recommend it because it works, not because it is loud',
    ],
    constraints: [
      'No budget for a huge launch — the product must market itself by being obviously useful',
      'Must feel effortless on first use; the audience abandons friction instantly',
      'Value must be obvious within the first session',
    ],
    potentialValue:
      `If ${lowerFirst(audience)} adopt this, the platform becomes the default way to ${describeOutcome(p)} — creating lock-in and a foundation for premium or paid tiers later.`,
    openQuestions: [
      'What is the growth loop that brings users back after the first win?',
      'Which single metric best measures "did we solve the problem"?',
      'Should the product stay narrow and excellent, or expand into adjacent needs?',
      'Who pays: users, or the organizations those users belong to?',
    ],
    assumptions: [
      'The audience feels this pain strongly enough to switch tools',
      'A transparent, explainable approach beats a mysterious black box',
      'Early adopters will share it if the first experience is delightful',
    ],
  };
  return {
    data: { needsClarification: false, discovery } satisfies DiscoveryAIResult,
    reasoning: [
      `Extracted a sharp problem ("${problem}") and audience (${audience}) — the anchors every later stage builds on.`,
      'Kept open questions and assumptions explicit so the founder controls strategic unknowns.',
      'Flagged trust/transparency as the core brand promise for this idea.',
    ],
  };
}

function isStr(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0 && v.trim() !== 'Skip';
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function describeOutcome(p: IdeaProfile): string {
  if (p.isStudent) return 'find the right teammates and ship projects together';
  if (p.audience) return `get ${lowerFirst(p.audience)} to their outcome with less friction`;
  return 'turn a rough start into a finished, reliable result';
}

function genPositioning(ctx: MockCtx, project: Project): { data: unknown; reasoning: string[] } {
  const idea = ctx.idea;
  const p = analyze(idea);
  const audience = project.stages.discovery?.targetAudience ?? p.audience ?? 'the target audience';
  const problem = project.stages.discovery?.problemSolved ?? p.problem ?? 'the friction of the current approach';
  const baseNoun = p.isStudent ? 'students' : lowerFirst(audience);

  const directions = [
    {
      id: 'dir_1',
      name: 'Fit-first',
      angle: `Lead with smart matching: pairing ${baseNoun} to the right people, tools or path via an intelligent matching layer — the "dating app" of ${lowerFirst(problem)}.`,
      summary: `Position the brand as the intelligent matchmaker — the product that eliminates the lottery of choosing wrong among ${baseNoun}.`,
      why: 'Matching is the most defensible and demonstrable angle: it directly kills the #1 pain and gives the algorithm a starring role.',
      productCategory: 'Intelligent matching platform',
      targetAudience: audience,
      primaryProblem: problem,
      secondaryProblems: [
        'No reliable signal to tell good fits from bad ones',
        'The current process is slow, manual and stressful',
        'Half the outcome depends on luck rather than design',
      ],
      valueProposition: 'The right fit, found in minutes — decided on signals, not luck.',
      keyDifferentiator: 'A transparent matching layer that scores compatibility on the signals that actually predict success.',
      competitiveAngle: 'Generic tools host or list; this product owns the decision moment — the match.',
      reasonsToBelieve: [
        'Matching uses transparent, explainable criteria',
        'Speed is measured, not claimed — match in minutes',
        'Users stay in control and can review every suggestion',
      ],
      positioningStatement: `For ${lowerFirst(audience)} tired of the lottery, this is the intelligent match that pairs you on what actually predicts success — so outcomes stop depending on luck.`,
      fit: { audience: 5, differentiation: 5, clarity: 4 },
    },
    {
      id: 'dir_2',
      name: 'Community-first',
      angle: `Build the home where ${baseNoun} already gather — the shared space where the problem is solved socially, with matching as a natural feature inside the community.`,
      summary: `Position the brand as the community home for ${lowerFirst(audience)} — where people meet, share and get the outcome together.`,
      why: 'Community platforms win on retention and default behavior: if people are already here, the outcome is one step away.',
      productCategory: 'Community platform',
      targetAudience: audience,
      primaryProblem: 'Scattered groups and dead channels mean nothing ever gets done in one place',
      secondaryProblems: [
        'No single home people return to',
        'Trust is low because there is no shared identity',
        'Discovery of other members/projects barely exists',
      ],
      valueProposition: 'One shared home where the outcome happens naturally — because the people are already here.',
      keyDifferentiator: 'A purpose-built community where belonging and outcomes reinforce each other.',
      competitiveAngle: 'Social giants fragment communities; this consolidates them around a job to be done.',
      reasonsToBelieve: [
        'Communities self-organize once they have a shared home',
        'Retention comes from belonging, not notifications',
        'Network effects compound as more members join',
      ],
      positioningStatement: `For ${lowerFirst(audience)} scattered across dead channels, X is the community home where the outcome actually happens.`,
      fit: { audience: 5, differentiation: 3, clarity: 3 },
    },
    {
      id: 'dir_3',
      name: 'Simplification-first',
      angle: `Remove 90% of the process: no learning curve, no setup, no process — the outcome in as few steps as possible. For ${baseNoun} who are busy and impatient.`,
      summary: `Position the brand as the dead-simple way to ${describeOutcome(p)} — so effortless it feels obvious.`,
      why: 'Simplicity is the most universally felt difference and the easiest to demonstrate in a live demo: fewer steps, less time, zero manuals.',
      productCategory: 'Effortless productivity tool',
      targetAudience: audience,
      primaryProblem: 'The existing way is so slow and fiddly that people avoid it until it is urgent',
      secondaryProblems: [
        'Setup takes longer than the task itself',
        'Feature bloat buries the one thing users actually need',
        'Impatient users abandon tools that demand learning curves',
      ],
      valueProposition: 'The outcome, minus the process. Three steps, thirty seconds.',
      keyDifferentiator: 'Radical reduction: the product does the process so the user does the thinking.',
      competitiveAngle: 'Competitors sell power; this sells removal of work. The demo IS the differentiator.',
      reasonsToBelieve: [
        'Time-to-first-outcome is measurable and demoable',
        'No manual, no onboarding — the UI explains itself',
        'Opinionated defaults tuned to the audience',
      ],
      positioningStatement: `For ${lowerFirst(audience)} who will not read a manual, X removes the process — the outcome in three steps, thirty seconds.`,
      fit: { audience: 4, differentiation: 4, clarity: 5 },
    },
  ];

  const selectedId = 'dir_1';

  return {
    data: { directions, selectedDirectionId: selectedId } satisfies Positioning,
    reasoning: [
      'Built three directions around three genuinely different strategic bets: the match moment, the network, and radical simplicity.',
      'Fit-first selected: it directly kills the #1 pain and is the most demonstrable in a product demo.',
      'Each direction names a different moat — algorithm (fit), network effects (community), remove-work (simplicity).',
    ],
  };
}

function genPersonality(ctx: MockCtx, project: Project): { data: unknown; reasoning: string[] } {
  const p = analyze(ctx.idea);
  const audience = project.stages.discovery?.targetAudience ?? p.audience ?? 'the audience';
  const posName = project.stages.positioning?.directions[0]?.name ?? 'the chosen direction';

  const personality: Personality = {
    traits: [
      {
        trait: 'Energetic',
        explanation: `The audience (${lowerFirst(audience)}) is busy and deadline-driven — energy signals momentum, that this is the place things actually get done, not another abandoned tool.`,
      },
      {
        trait: 'Pragmatic',
        explanation: 'No patience for fluff when it matters: every message sells a concrete outcome — matched, scheduled, shipped — never vibes.',
      },
      {
        trait: 'Warm',
        explanation: 'The product works with people and choices, which is personal. Warmth lowers the guard and makes usage feel safe, not clinical.',
      },
      {
        trait: 'Sharp',
        explanation: 'A smart product should sound smart: crisp phrasing, honest trade-offs, zero vacuous startup-speak.',
      },
      {
        trait: 'Optimistic without hype',
        explanation: `The promise is real ("the ${lowerFirst(posName)} approach actually works") — optimism earned with proof, never guarantees.`,
      },
    ],
    traitsToAvoid: [
      'Corporate — “leverage synergies across our ecosystem” lands as noise',
      'Vacuous hype — superlatives without any evidence invite skepticism',
      'Bureaucratic — process-tone kills the energy of a product that removes process',
      'Cynical — alienates the very people this brand wants to convert',
    ],
    principles: [
      'Show the reasoning behind every recommendation — never ask for blind trust',
      'Preserve the user’s agency — the product suggests, the user decides',
      'Lead with the outcome, then the mechanism',
      'Sound like a capable peer, not a vendor or a hype engine',
    ],
    emotionalCharacteristics: [
      'Motivating at the frustrating start: “this should not be this hard — here is the fix”',
      'Reassuring at the decision moment: transparent signals, no black boxes',
      'Celebratory at the win: the finish is framed as an event, not an afterthought',
    ],
    communicationStyle:
      'Short, direct, a little playful — the tone of a sharp friend who clears the path for you. Sentence fragments are welcome, bullets do the work, and every piece of copy ends with a concrete next step.',
    voice: [
      { characteristic: 'Crisp', example: '“The hard part is handled. You just decide.”' },
      { characteristic: 'Peppy', example: '“Less setup. More done.”' },
      { characteristic: 'Confident but honest', example: '“A 94% fit is a strong signal — look, then decide.”' },
      { characteristic: 'Direct', example: '“Here are the three best options, with the reasons. Pick one.”' },
    ],
    toneWords: ['done', 'fit', 'your call', 'no fluff', 'minutes', 'transparent', 'ship'],
    justification: `The audience is ${lowerFirst(audience) || 'busy'} — skeptical of hype, impatient with friction, social by default. Energetic + warm earns attention; pragmatic + sharp earns trust under pressure; optimistic-without-hype keeps trust when things get hard. The ${lowerFirst(posName)} positioning demands a voice that explains decisions clearly — which is exactly what these traits encode.`,
  };
  return {
    data: personality,
    reasoning: [
      `Justified every trait against the audience: ${lowerFirst(audience)} rewards energy+clarity and punishes fluff.`,
      'Banned words list keeps the voice specific enough to write copy from.',
      'Principles map back to the product promise: transparent decisions, user control.',
    ],
  };
}

function genNaming(ctx: MockCtx, project: Project): { data: unknown; reasoning: string[] } {
  const seed = ctx.seed ?? hashSeed(ctx.idea + (project.stages.positioning?.selectedDirectionId ?? ''));
  const rnd = mulberry32(seed);
  const p = analyze(ctx.idea);
  const why = project.stages.positioning?.directions[0]?.why ?? '';
  const selName = pick(NAME_POOL, rnd);
  const options = shuffle(NAME_POOL, rnd)
    .slice(0, 9)
    .map((n, i) => ({ ...n, id: `n_${i}`, availabilityNote: 'No automatic domain/trademark verification performed. (Demo mode — simulated suggestion.)' }));

  const shortlisted = options.slice(0, 4).map((o) => o.id);

  return {
    data: {
      territories: Array.from(new Set(options.map((o) => o.territory))),
      options,
      shortlisted,
      selectedId: options.find((o) => o.name === selName.name)?.id ?? options[0].id,
      whyThisName: '',
    } satisfies Naming,
    reasoning: [
      'Generated names inside 5 territories so options diversify instead of clustering around one pattern.',
      `Selected “${selName.name}” for encoding both the people and the outcome${why ? ' — aligned with the chosen positioning direction.' : '.'}`,
      'Every option includes a declared weakness and an availability disclaimer — nothing is claimed unverified.',
    ],
  };
}

function genMessaging(ctx: MockCtx, project: Project): { data: unknown; reasoning: string[] } {
  const p = analyze(ctx.idea);
  const audience = project.stages.discovery?.targetAudience ?? p.audience ?? 'people like you';
  const selName = project.stages.naming?.options.find((o) => o.id === project.stages.naming?.selectedId)?.name ?? 'your new brand';
  const dirName = project.stages.positioning?.directions.find((d) => d.id === project.stages.positioning?.selectedDirectionId)?.name ?? '';
  const taglines = [
    'Less friction. More done.',
    'The right fit, found in minutes.',
    'Stop hoping. Start shipping.',
    'The smart way to get it done.',
  ];
  const seed = ctx.seed ?? 42;
  const rnd = mulberry32(seed);
  const sorted = shuffle(taglines, rnd);

  return {
    data: {
      taglines: sorted,
      selectedTagline: sorted[0],
      oneLinePitch: `${selName} is the ${lowerFirst(dirName || 'intelligent')} platform that helps ${lowerFirst(audience)} ${describeOutcome(p)} — faster, with transparency and control.`,
      elevatorPitch: [
        `The old way of ${lowerFirst(describeOutcome(p))} is a lottery of manual effort and luck. ${selName} replaces it with a transparent, intelligent system: ${lowerFirst(audience)} get clear, explainable suggestions in minutes, review the reasoning behind them, and keep full control of the final call.`,
        `No black boxes, no bloat, no wasted tries. In one sitting you go from "where do I even start" to "done."`,
      ].join(' '),
      valuePropositionStatement: 'Transparent intelligence that removes the guesswork — so the outcome happens shockingly fast.',
      keyMessage: `${selName} helps ${lowerFirst(audience)} reach the outcome with transparent, explainable intelligence — you stay in control, and the work actually gets done.`,
      supportingMessages: [
        'Explainable decisions — every suggestion comes with its reasoning',
        'Built for speed — the outcome in minutes, not meetings',
        'You stay in control — the product suggests, you decide',
        'No fluff, no manuals, no black boxes',
      ],
      ctas: ['Get it done', 'See how it fits', 'Start now', 'Find the right fit'],
      rationale: `Messaging is anchored on the ${lowerFirst(dirName || 'intelligent')} direction, voiced in the sharp-warm personality, and centered on the selected name (${selName}). Every line sells an outcome with concrete vocabulary — no superlatives, no claims without evidence.`,
    } satisfies Messaging,
    reasoning: [
      'Every line sells an outcome, never a feature list.',
      `Taglines were varied on regenerate (seeded) to give the founder real choices.`,
      'The pitch splits cleanly into problem → mechanism → control → result, in that order.',
    ],
  };
}

function genVisual(ctx: MockCtx, project: Project): { data: unknown; reasoning: string[] } {
  const p = analyze(ctx.idea);
  const audience = project.stages.discovery?.targetAudience ?? p.audience ?? 'a modern, busy audience';
  const personality = project.stages.personality?.traits.map((t) => t.trait.toLowerCase()) ?? [];
  const warm = personality.includes('warm');
  const energetic = personality.includes('energetic');

  const visual: Visual = {
    concept: '“Signal on a field of calm” — one glowing focal element (the outcome) floating on a deep, quiet base. The product is the bright signal; everything else recedes.',
    conceptWhy: 'The concept encodes the core promise (a clear signal among noise) instead of decorating. It matches a transparent decision engine: calm base, bright answer.',
    colorDirection: warm
      ? 'Deep twilight base with warm amber and violet accents — the calm field with a glowing, human signal.'
      : 'Deep midnight base with an electric accent — the signal that cuts through noise.',
    primaryColors: [
      { hex: '#191833', role: 'Base — Midnight', why: 'Quiet, premium field that makes the signal glow instead of competing with it.' },
      { hex: warm ? '#FFB454' : '#6C5CE7', role: 'Signal — Primary accent', why: 'The one bright color reserved for the outcome moments — attention lands exactly where value happens.' },
      { hex: '#F6F4FF', role: 'Voice — Near-white ink', why: 'High-contrast text color for crisp, scannable structured output.' },
    ],
    secondaryColors: [
      { hex: '#2FD3A5', role: 'Success — Trust mint', why: 'Reserved for “decided / verified / done” states — earned rewards, never decoration.' },
      { hex: '#FF6B6B', role: 'Alert — Coral', why: 'Urgency for risk or attention states without feeling aggressive; paired with calm copy.' },
      { hex: '#262451', role: 'Depth — Elevated surface', why: 'Card and panel surface that keeps the hierarchy clear without borders shouting.' },
    ],
    typographyDirection:
      'A confident grotesque for headlines (modern, slightly condensed, no serif nostalgia) paired with a highly legible humanist sans for body. Mono is reserved for scores and data so numbers feel engineered and honest.',
    fonts: [
      { role: 'Display / headlines', name: 'Space Grotesk', why: 'Geometric with technical terminals — reads like a modern system, not a lifestyle brand.' },
      { role: 'Body / UI', name: 'Inter', why: 'Neutral, fast-reading; keeps structured output (scores, lists, cards) scannable.' },
      { role: 'Data / scores', name: 'JetBrains Mono', why: 'Scores and stats feel engineer-honest in a mono face.' },
    ],
    shapeLanguage: 'Soft geometry — rounded rectangles for information, perfect circles for people, connecting arcs for fit. No sharp corners, no corporate boxes; everything is softly geometric and oriented toward a center.',
    imageryStyle: `Real, candid photography of ${lowerFirst(audience)} mid-flow (desks, whiteboards, screens) with abstract signal overlays — never staged smiles at a laptop, never generic stock.`,
    iconography: '1px-outline geometric icons built from circles and arcs. Consistent stroke weight. Icons carry meaning, never decoration.',
    logoConcept: 'Two intersecting orbits sharing one glowing center — the meeting point where the outcome happens. In mono it prints as interlocking rings; the center ignites on interaction.',
    compositionStyle: 'Generous whitespace, cards on a quiet base, every screen anchored by exactly one glowing focal element — the outcome, always on stage.',
    mood: energetic || warm ? 'Electric but grounded — serious about the work, excited about the outcome.' : 'Calm and confident — a quiet expert that makes hard things feel easy.',
    avoid: [
      'Corporate blue gradients',
      'Generic AI purple-pink full-screen gradients',
      'Stacked hands / puzzle-piece teamwork icons',
      'Stock-photo smiles on laptops',
      'Busy screens — one focal point per screen, always',
    ],
    whyFitsAudience: `The audience (${lowerFirst(audience)}) trusts systems: a visible signal-on-calm metaphor reassures them the product is transparent, while ${warm ? 'the warm amber hue and candid imagery' : 'the crisp electric accent and system-like geometry'} keep it human. Colors are semantic — they carry meaning (signal, trust, alert) instead of decoration, which mirrors the product’s transparent intelligence.`,
  };
  return {
    data: visual,
    reasoning: [
      'Every decision maps back to the audience and personality — colors are semantic micro-moments, not random palettes.',
      'The single-focal-point composition directly mirrors the product promise: one clear answer on a calm field.',
    ],
  };
}

function genCritique(ctx: MockCtx, project: Project): { data: unknown; reasoning: string[] } {
  const s = project.stages;
  const issues: Critique['issues'] = [];
  const strengths: string[] = [];

  if (s.messaging) {
    const pitch = s.messaging.oneLinePitch;
    if (/seamless|innovative|revolutionary|cutting-edge|game-chang/i.test(pitch)) {
      issues.push({
        id: 'c_fluff',
        type: 'Cliché',
        issue: 'The one-line pitch uses a banned hype word — it reads generic to skeptical audiences.',
        whyProblem: 'Hype vocabulary trains audiences to tune out; it actively weakens trust with the exact people this brand needs to convince.',
        evidence: `oneLinePitch contains "${pitch.match(/seamless|innovative|revolutionary|cutting-edge|game-chang/i)?.[0]}".`,
        suggestion: 'Replace the hype word with the concrete mechanism: say what the product does and in how many steps.',
        severity: 'medium' as const,
        status: 'open' as const,
        target: {
          stage: 'messaging',
          path: 'oneLinePitch',
          value: 'Replace superlatives with the concrete mechanism and a measurable promise (e.g., "the outcome in three steps, thirty seconds").',
          label: 'De-hype the pitch',
        },
      });
    }
    if ((s.messaging.supportingMessages ?? []).filter((m) => /no more|no longer|never/i.test(m)).length >= 2) {
      issues.push({
        id: 'c_neg',
        type: 'Weak messaging pattern',
        issue: 'Two or more supporting messages are framed as negations (“no more X”).',
        whyProblem: 'Negation copy tells people what to avoid, not what to gain — repeated negations read defensive instead of confident.',
        evidence: `supportingMessages contains ${s.messaging.supportingMessages.filter((m) => /no more|no longer|never/i.test(m)).length} negated framings.`,
        suggestion: 'Flip at least one to a positive frame that names the reward.',
        severity: 'low' as const,
        status: 'open' as const,
        target: { stage: 'messaging', path: 'supportingMessages', value: 'Flip at least one supporting message to a positive frame that names the reward instead of the avoidance.', label: 'Reframe negations positively' },
      });
    }
    if (!s.messaging.selectedTagline) {
      issues.push({
        id: 'c_tag',
        type: 'Missing decision',
        issue: 'No tagline has been selected yet.',
        whyProblem: 'The tagline is the most repeated brand asset; leaving it undecided leaves the brand unanchored.',
        evidence: 'messaging.selectedTagline is null.',
        suggestion: 'Choose the tagline that best names the outcome and matches the voice.',
        severity: 'low' as const,
        status: 'open' as const,
      });
    }
  }

  if (s.naming) {
    const patterned = s.naming.options.filter((o) => /ia$|-ify|^my|co$/.test(o.name));
    if (patterned.length >= 2) {
      issues.push({
        id: 'c_pattern',
        type: 'Overused naming pattern',
        issue: `Several candidate names follow overused startup patterns (${patterned.map((o) => '“' + o.name + '"').join(', ')}).`,
        whyProblem: 'Patterned names reduce distinctiveness — they look generated, which undermines the brand story.',
        evidence: `Naming pool contains ${patterned.length} names matching common template patterns.`,
        suggestion: 'Prefer names that encode meaning specific to the product over template suffixes.',
        severity: 'medium' as const,
        status: 'open' as const,
        target: { stage: 'naming', path: 'whyThisName', value: 'Final shortlist favors names that encode product meaning over template patterns (-ia, my-, -ify) to stay distinctive.', label: 'Prefer meaning-encoding names' },
      });
    }
  }

  if (s.discovery && !s.discovery.openQuestions.some((q) => /retention|return|again|loop/i.test(q))) {
    issues.push({
      id: 'c_retention',
      type: 'Unsupported assumption',
      issue: 'No defined reason for users to return after their first win.',
      whyProblem: 'A one-time outcome creates a one-time user; without a return loop the metrics look great for week one and die by week four.',
      evidence: 'discovery.openQuestions contains no retention/return-loop question.',
      suggestion: 'Add a return trigger — a recurring event, a growing record, or a social tie that brings users back.',
      severity: 'high' as const,
      status: 'open' as const,
      target: { stage: 'discovery', path: 'openQuestions', value: 'After the first win, define a return trigger: a recurring event, a growing personal record, or a social tie that brings users back.', label: 'Add retention-loop question' },
    });
  }

  if (s.visual && s.visual.avoid.some((a) => /gradient/i.test(a)) && !s.visual.primaryColors.some((c) => /purple|pink/i.test(c.role + c.why))) {
    strengths.push('Color choices are semantic (signal/trust/alert) rather than decorative — no random gradient palettes.');
  }
  strengths.push('The structured pipeline means every stage has explicit, editable reasoning behind it.', 'Critique is independent: it flags real issues rather than approving the output flatly.');

  if (issues.length < 3) {
    issues.push({
      id: 'c_verify',
      type: 'Verification gap',
      issue: 'All names carry a domain/trademark disclaimer, but no name has been checked for real-world collisions.',
      whyProblem: 'A great name that collides with an existing trademark is a launch-stopper.',
      evidence: 'Naming.availabilityNote on every option is the standard disclaimer.',
      suggestion: 'Before launch, run a trademark + domain check on the final name; keep one backup name.',
      severity: 'medium' as const,
      status: 'open' as const,
    });
  }

  const score = Math.max(55, 88 - issues.length * 4);
  return {
    data: {
      summary:
        'The critic reviewed every stage independently. The core direction is sound and the pipeline is internally coherent; the issues below are the highest-leverage fixes before launch — led by the retention gap.',
      score,
      strengths,
      issues,
    } satisfies Critique,
    reasoning: [
      'Scan targets concrete, quotable evidence — every issue cites the source field.',
      'Severity-weighted: the retention gap is highest because it threatens week-4 metrics, not just polish.',
      'Suggestions include editable correction paths so the founder can apply or reject each fix.',
    ],
  };
}

function genConsistency(ctx: MockCtx, project: Project): { data: unknown; reasoning: string[] } {
  const s = project.stages;
  const conflicts: ConsistencyReport['conflicts'] = [];
  const strengths: string[] = [];

  if (s.personality && s.messaging) {
    const playful = /playful|energetic|warm/i.test(JSON.stringify(s.personality.traits.map((t) => t.trait)));
    const corporate = /corporate|formal|b2b/i.test(JSON.stringify(s.personality.voice) + JSON.stringify(s.messaging.oneLinePitch));
    if (playful && corporate) {
      conflicts.push({
        id: 'k_voice',
        components: ['Personality', 'Messaging'],
        conflict: 'Personality is defined as playful/warm while the pitch copy sounds corporate.',
        explanation: 'A warm brand cannot talk like a vendor in its most public sentence — the two surfaces contradict each other.',
        correction: 'Rewrite the pitch and key message in the defined voice: short, direct, outcome-first, no institutional filler.',
        severity: 'medium' as const,
        status: 'open' as const,
        target: { stage: 'messaging', path: 'keyMessage', value: 'Rewrite the key message in the defined voice — short, direct, outcome-first, zero institutional filler.', label: 'Rewrite key message on-voice' },
      });
    } else {
      strengths.push('Voice and messaging match: the pitch reads in the same sharp-warm registers as the personality definition.');
    }
  }

  if (s.naming && s.visual) {
    const name = s.naming!.options.find((o) => o.id === s.naming!.selectedId);
    const playfulVisual = /playful|warm|amber|bright/i.test(JSON.stringify(s.visual.primaryColors) + s.visual.mood);
    const formalName = name && /pact|forge|scribe|guard/i.test(name.name);
    if (formalName && playfulVisual) {
      conflicts.push({
        id: 'k_name',
        components: ['Naming', 'Visual'],
        conflict: 'The selected name has a formal tail while the visual language reads warm/playful.',
        explanation: '“Pact/Forge”-style names promise commitment; warm visuals promise friendliness. Neither is wrong, but they must be consciously balanced or the brand splits in two.',
        correction: 'Codify a two-surface tone: playful warmth in social/student surfaces, quiet commitment in institutional surfaces — never mixed in one sentence.',
        severity: 'medium' as const,
        status: 'open' as const,
        target: { stage: 'personality', path: 'principles', value: 'Adopt a deliberate two-surface tone: playful warmth on social surfaces, quiet commitment on institutional surfaces — never mixed in a single sentence.', label: 'Codify two-surface tone' },
      });
    } else {
      strengths.push('Name temperament and visual mood are compatible — no tonal clash detected.');
    }
  }

  if (s.messaging && s.messaging.selectedTagline && s.launch) {
    const tag = s.messaging.selectedTagline.toLowerCase();
    const social = [s.launch.social.launchPost, s.launch.social.twitter, s.launch.social.instagram].join(' ').toLowerCase();
    if (/less friction|more done/.test(tag) && !/less friction|more done/.test(social)) {
      conflicts.push({
        id: 'k_tag',
        components: ['Messaging', 'Launch'],
        conflict: 'The chosen tagline never appears in the launch campaign copy.',
        explanation: 'The most-repeated line of the launch (posts, headers) should anchor to the brand asset — otherwise the campaign feels disconnected from the identity.',
        correction: 'Weave the tagline into at least the hero and the launch post, or swap it for the line the campaign actually uses.',
        severity: 'low' as const,
        status: 'open' as const,
        target: { stage: 'launch', path: 'landing.heroHeadline', value: 'Use the selected tagline as the hero headline so the campaign anchors to the brand asset.', label: 'Anchor hero to tagline' },
      });
    } else {
      strengths.push('Tagline and launch copy reference each other — the campaign is anchored to the brand asset.');
    }
  }

  strengths.push(
    'Positioning, personality and messaging tell one story: transparent intelligence, user control, concrete outcomes.',
    'The color system’s semantic roles (signal/trust/alert) carry meaning consistently across all visual surfaces.',
  );

  const hasHigh = conflicts.some((c) => c.severity === 'high');
  const status: ConsistencyReport['status'] = conflicts.length === 0 ? 'aligned' : hasHigh ? 'conflicts' : 'attention';
  const score = Math.max(55, 94 - conflicts.length * 4);

  return {
    data: {
      status,
      score,
      summary:
        conflicts.length === 0
          ? 'Every stage reads as one brand system — name, voice, visuals and launch copy reinforce the same promise.'
          : 'The brand is coherent overall; the flagged conflicts are tonal ties that need conscious management before launch.',
      strengths,
      conflicts,
    } satisfies ConsistencyReport,
    reasoning: [
      'Rules compare real fields across stages (voice vs pitch, name temperament vs visual mood, tagline vs campaign) — checks are evidence-based, not vibes.',
      ...conflicts.map((c) => `Flagged ${c.components.join(' × ')}: ${c.conflict}`),
    ],
  };
}

function genLaunch(ctx: MockCtx, project: Project): { data: unknown; reasoning: string[] } {
  const s = project.stages;
  const p = analyze(ctx.idea);
  const audience = s.discovery?.targetAudience ?? p.audience ?? 'people who are done with the old way';
  const name = s.naming?.options.find((o) => o.id === s.naming?.selectedId)?.name ?? 'this brand';
  const tagline = s.messaging?.selectedTagline ?? 'Less friction. More done.';
  const pitch = s.messaging?.oneLinePitch ?? '';
  const outcome = describeOutcome(p);
  const handle = `get${name.toLowerCase().replace(/[^a-z]/g, '')}`.slice(0, 15);

  const launch: Launch = {
    landing: {
      heroHeadline: tagline,
      subheadline: `${name} helps ${lowerFirst(audience)} ${outcome} — transparent, explainable, and shockingly fast. You stay in control; the work actually gets done.`,
      cta: 'Get it done',
      features: [
        { title: 'Explainable decisions', description: 'Every suggestion arrives with the reasoning behind it — no black boxes, no “trust us”.' },
        { title: 'Built for speed', description: 'From start to outcome in minutes — the boring process is handled, the decision is yours.' },
        { title: 'You stay in control', description: 'The product suggests; you decide. Review, tweak, or override any recommendation.' },
        { title: 'No bloat', description: 'No manuals, no learning curves, no features that bury the one thing you need.' },
      ],
      about: `It started with a simple observation: the old way of ${lowerFirst(outcome)} wastes more time than the outcome itself. So we built ${name} — a transparent intelligence layer that removes the guesswork while leaving every decision in your hands. No hype, no black boxes, just the outcome, faster.`,
    },
    social: {
      launchPost: [
        `✨ We got tired of the old way of ${lowerFirst(outcome)}. So we built the fix.`,
        '',
        `${name} ${pitch}`,
        '',
        `✓ Explainable decisions    ✓ Done in minutes    ✓ You stay in control`,
        '',
        `Try it: ${handle}.app`,
      ].join('\n'),
      shortAnnouncement: `🚀 ${name} is live — smart, transparent, and fast. ${pitch} Try it → ${handle}.app`,
      twitter: `the old way of ${lowerFirst(outcome)} is a lottery 🎲\n\n${name} fixes that: transparent decisions, done in minutes, you stay in control.\n\nno hype. just results. ${handle}.app`,
      linkedin: `Most problems don’t fail because they’re hard — they fail because the process around them is manual, opaque and slow.\n\nWe built ${name}, an intelligence layer that ${lowerFirst(outcome)} — with explainable decisions, concrete speed, and full user control. No black boxes, no bloat.\n\n${pitch}\n\nTry it at ${handle}.app — we’d love your feedback.`,
      instagram: `your best work starts with less friction 🚀✨\n\n${name} gets you from "where do I start" to done — with transparent suggestions and zero guesswork.\n\nlink in bio → ${handle}.app 💜`,
    },
    productMessaging: {
      appDescription: `${name} is the transparent intelligence platform for ${lowerFirst(audience)}. ${pitch} Every suggestion comes with its reasoning; you keep the final call. Fast, honest, and built to ship.`,
      shortDescription: 'Transparent intelligence that gets things done — fast, explainable, in your control.',
      elevatorPitch: s.messaging?.elevatorPitch ?? pitch,
      appStoreDescription: [
        `The old way of ${lowerFirst(outcome)} is slow, opaque and full of guesswork.`,
        '',
        `${name} replaces it with transparent intelligence:`,
        '• Explainable suggestions with real reasoning',
        '• Outcomes in minutes, not meetings',
        '• You stay in control — the product suggests, you decide',
        '• No manuals, no bloat, no black boxes',
        '',
        `Made for ${lowerFirst(audience)} who are done wasting time.`,
      ].join('\n'),
    },
  };

  return {
    data: launch,
    reasoning: [
      `Channel-specific copy: meme-native for social, credible for LinkedIn and app stores — all in the same sharp-warm voice.`,
      'Every asset anchors to the selected tagline and one-line pitch, so launch content reinforces (never contradicts) the brand system.',
      'Tone matches the personality across all five channels — verified by the Consistency Guardian.',
    ],
  };
}

// ------------------------------------------------------------
// Entry point
// ------------------------------------------------------------
export function generateMock(stage: StageKey, project: Project, extra?: { answers?: Record<string, string>; seed?: number }): {
  ok: true;
  data: unknown;
  reasoning: string[];
  model: string;
} {
  const ctx: MockCtx = {
    idea: project.idea,
    project,
    answers: extra?.answers,
    seed: extra?.seed,
  };
  const r = (() => {
    switch (stage) {
      case 'discovery':
        return genDiscovery(ctx);
      case 'positioning':
        return genPositioning(ctx, project);
      case 'personality':
        return genPersonality(ctx, project);
      case 'naming':
        return genNaming(ctx, project);
      case 'messaging':
        return genMessaging(ctx, project);
      case 'visual':
        return genVisual(ctx, project);
      case 'critique':
        return genCritique(ctx, project);
      case 'consistency':
        return genConsistency(ctx, project);
      case 'launch':
        return genLaunch(ctx, project);
    }
  })();
  return { ok: true, data: r.data, reasoning: r.reasoning, model: 'simulated-strategist' };
}