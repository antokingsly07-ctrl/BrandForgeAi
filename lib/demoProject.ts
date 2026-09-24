// ============================================================
// BrandForge AI — Demo / sample project
// A fully-worked example brand so the workflow can be explored
// instantly without an API key. Clearly flagged as a sample in
// the UI. The idea: an AI teammate-matching platform for
// college students.
// ============================================================
import { makeId } from './utils';
import type { Project, ProjectStages, StageInsight } from './types';

export const DEMO_IDEA =
  'An AI-powered platform that helps college students find compatible teammates for projects and hackathons.';

function insight(model: string, prompt: string, reasoning: string[]): StageInsight {
  return {
    mode: 'simulated',
    model,
    prompt,
    reasoning,
    generatedAt: new Date().toISOString(),
  };
}

function stages(): ProjectStages {
  return {
    discovery: {
      coreIdea:
        'Teampact is an AI-powered matching platform that pairs college students into compatible teams for academic projects and hackathons — based on skills, goals, working style and schedule.',
      problemSolved:
        'Finding teammates today is a lottery. Students rely on group chats, boards and luck, then waste weeks with incompatible partners, ghosting and uneven workloads. Good projects die from bad teams, not bad ideas.',
      targetAudience:
        'Secondary: college students (especially CS, design, business) aged 18–24 who join classroom group work, semester projects and hackathons. Primary daily users are project leads and active hackathon participants.',
      userNeeds: [
        'Find teammates with complementary, verifiable skills — not just claimed ones',
        'Match on availability and schedule to avoid coordination pain',
        'Filter by commitment level (grade-focused vs. hackathon-focused)',
        'See working-style compatibility before committing a semester',
        'Join or form teams across departments and events',
        'Move from match to kickoff fast — vetting, channel, files, first meeting',
      ],
      context:
        'Campus team formation is fragmented: official class groups, Discord servers per hackathon, department boards, word of mouth. No platform owns the "match" moment. Teams peak at hackathons and semester-start, creating strong seasonal user pull; the audience is digital-native and comfortable with dating-app-style matching metaphors.',
      goals: [
        'Cut time-to-team from ~5 days to under an hour',
        'Reduce failed/ghosted teams by verifiable skill + compatibility matching',
        'Own the campus team-formation moment and become the default infra under hackathons and group projects',
      ],
      constraints: [
        'Must work inside a school term — onboarding and value must land in weeks, not months',
        'Campus data (rosters, skills) is fragmented; needs self-reported + proven-portfolio signals',
        'Monetization-sensitive audience: freemium with institutional tiers',
        'Viral loop depends on group invites arriving before the match moment',
      ],
      potentialValue:
        'A platform that owns team formation reduces churn on every derivative surface: hackathon sponsors, institutional licensing, skills marketplaces and career services data.',
      openQuestions: [
        'Should matches be anonymous-first (Tinder-style) or identity-first (LinkedIn-style)?',
        'Do hackathon organizers pay to pre-seed teams, or do we stay consumer-only at launch?',
        'How do we verify skill signals without bureaucratic friction?',
        'Which campus gets the first pilot, and what is the retention metric we optimize?',
      ],
      assumptions: [
        'Students are tired enough of group-project roulette to adopt a dedicated tool',
        'Schedule + working style tell more about team success than major alone',
        'A "match" moment at semester-start organically bootstraps network effects',
      ],
    },

    positioning: {
      directions: [
        {
          id: 'compatibility',
          name: 'Compatibility-first',
          angle:
            'Matchmaking as the core innovation — the "dating app, but for teammates" that pairs on skills, schedule and working style via a proprietary compatibility score.',
          summary:
            'Position Teampact as the intelligent matchmaker for student teams — the first product that treats finding a teammate like a serious compatibility decision, not a lottery.',
          why: 'Students live the pain of incompatible teammates daily. A compatibility score is tangible, defensible and matches how this audience already thinks (dating apps normalized match scores). It gives the algorithm a starring role, which is our moat.',
          productCategory: 'AI teammate-matchmaking platform for students',
          targetAudience:
            'Self-motivated students who are tired of unreliable teammates and want control over who they commit a semester to.',
          primaryProblem:
            'No reliable way to find teammates who have the right skills, availability and working style before committing.',
          secondaryProblems: [
            'Ghosting and uneven workload in group projects',
            'No way to see real skill signals, only claimed CV bullet points',
            'Coordination overhead — scheduling, channels, first meetings — kills momentum',
          ],
          valueProposition:
            'Stop gambling on teammates. Get matched in minutes with a verifiable compatibility score so your project actually ships.',
          keyDifferentiator:
            'A transparent compatibility algorithm that matches on skills, schedule and working style — not just proximity or claimed interests.',
          competitiveAngle:
            'Where existing tools only host teams or boards, Teampact owns the decision moment: the match. Nothing else scores compatibility before students commit.',
          reasonsToBelieve: [
            'Compatibility score weighs self-declared skills against portfolio proof',
            'Schedule clash detection prevents the #1 cause of team death',
            'Team-formation analytics proven in campus pilots',
          ],
          positioningStatement:
            'For college students who are done gambling on group projects, Teampact is the AI teammate matchmaker that pairs you on skills, availability and working style — so every project ships.',
          fit: { audience: 5, differentiation: 5, clarity: 4 },
        },
        {
          id: 'community',
          name: 'Community-first',
          angle:
            'Build the campus collaboration home — a hub where student communities, clubs, hackathons and classes already hang out, and teams simply form inside the flow.',
          summary:
            'Position Teampact as the operating system for campus collaboration — the place student communities gather and teams form naturally.',
          why: 'Community platforms win on retention and default behavior. If Teampact becomes where campus groups already are, matching is a feature — but the community is the gravity. Weaker near-term differentiation, stronger lock-in and LTV.',
          productCategory: 'Campus collaboration community platform',
          targetAudience: 'Every campus community — clubs, hackathons, study groups, class cohorts',
          primaryProblem:
            'Student collaboration is scattered across dozens of dead channels with no shared home.',
          secondaryProblems: [
            'Clubs and hackathons rebuild the same infrastructure every semester',
            'Cross-community discovery is nonexistent',
            'No retention because there is no single place students return to',
          ],
          valueProposition:
            'One home for campus collaboration — teams, clubs and events in a single community hub that keeps students coming back.',
          keyDifferentiator:
            'A purpose-built campus community OS where matching, events and channels live under one roof.',
          competitiveAngle:
            'Generic social platforms fragment communities; Teampact consolidates the campus under one roof and earns the network effects.',
          reasonsToBelieve: [
            'Community-first onboarding means every existing club brings its members',
            'Events calendar + channels drive daily returns, not just project-time spikes',
            'Organization model matches how campuses are actually structured',
          ],
          positioningStatement:
            'For student communities scattered across dead group chats, Teampact is the campus collaboration home where teams, clubs and events meet — so nothing gets lost.',
          fit: { audience: 5, differentiation: 3, clarity: 3 },
        },
        {
          id: 'skill',
          name: 'Skill-first',
          angle:
            'A meritocracy of skills — Teampact as a portfolio-grade skill graph where students prove what they can do, and teams are assembled around verified ability.',
          summary:
            'Position Teampact as the skill-verified pipeline that assembles teams around proven ability — a serious, career-relevant tool rather than a casual matchmaker.',
          why: 'The skill vector is the most career-relevant and institutionally valuable. It appeals to career services, sponsors and motivated students — enabling institutional revenue later. Slightly cooler emotional hook, but strong credibility route.',
          productCategory: 'Skill-verified team assembly platform',
          targetAudience:
            'Career-focused students and institutions that care about demonstrated capability.',
          primaryProblem:
            'Resumes overstate skills, so teams assemble on claims and discover mismatches too late.',
          secondaryProblems: [
            'No portable record of the projects you actually shipped',
            'Career services cannot connect skills evidence to outcomes',
            'Hackathons struggle to seed fair, balanced teams',
          ],
          valueProposition:
            'Teams built on proof, not promises — Teampact assembles groups around verified skills and shipped work.',
          keyDifferentiator:
            'A verified skill graph (projects, endorsements, artifacts) that recruiters and organizers take seriously.',
          competitiveAngle:
            'Matchmakers use self-reported vibes; Teampact uses an evidence trail that compounds into a career asset.',
          reasonsToBelieve: [
            'Skill profiles carry portfolio artifacts, not just tags',
            'Team balance analytics let organizers seed fair teams at scale',
            'Integrates with career services as a skills passport',
          ],
          positioningStatement:
            'For students and institutions tired of résumé roulette, Teampact assembles teams from verified skills and shipped work — so the best people ship, and the work proves it.',
          fit: { audience: 4, differentiation: 4, clarity: 3 },
        },
      ],
      selectedDirectionId: 'compatibility',
    },

    personality: {
      traits: [
        {
          trait: 'Energetic',
          explanation:
            'The audience is 18–24, action-oriented and lives in fast-moving group chats. Energy signals momentum — that this is the place things actually get built.',
        },
        {
          trait: 'Pragmatic',
          explanation:
            'Students have zero patience for fluff when a deadline looms. Pragmatism means every message sells a concrete outcome — matched, scheduled, shipped.',
        },
        {
          trait: 'Warm',
          explanation:
            'Talking about compatibility and forming teams is social and personal. Warmth lowers the guard and makes the match metaphor feel safe, not clinical.',
        },
        {
          trait: 'Sharp',
          explanation:
            'A smart product should sound smart. Sharpness means crisp phrasing, honest trade-offs and zero vacuous startup-speak — credible in front of a skeptical, technical audience.',
        },
        {
          trait: 'Optimistic without hype',
          explanation:
            'The pitch is "your projects will actually ship." Optimism belongs — but qualified — so trust survives a missed deadline. We cheer outcomes, never guarantees.',
        },
      ],
      traitsToAvoid: [
        'Corporate — "leverage synergies across our ecosystem" lands as noise',
        'Vacuous hype — "revolutionary AI magic" without proof invites eye rolls',
        'Bureaucratic — audit-tone language kills the matchmoment energy',
        'Cynical — the roommate-drama energy repels organizers and sponsors',
      ],
      principles: [
        'Show the reasoning behind every recommendation — never ask for blind trust',
        'Preserve the user’s agency — matching suggests, students decide',
        'Lead with the outcome, then the mechanism',
        'Sound like a capable peer, not a vendor or a hype engine',
      ],
      emotionalCharacteristics: [
        'Motivating during group-project dread: "find your people and ship"',
        'Reassuring at match time: transparent scores, no black boxes',
        'Celebratory at kickoff: the first meeting is framed as an event',
      ],
      communicationStyle:
        'Short, direct, a little playful — the tone of a sharp friend who runs your project standup. Sentences are crisp, bullets do the work, and every piece of copy ends with a concrete next step.',
      voice: [
        {
          characteristic: 'Crisp',
          example: '“Stop gambling on teammates.”',
        },
        {
          characteristic: 'Peppy',
          example: '“Find your people. Ship your project.”',
        },
        {
          characteristic: 'Confident but honest',
          example: '“A 94% match is a strong signal — meet them, then decide.”',
        },
        {
          characteristic: 'Direct',
          example: '“Your team needs a designer. Here are three who are free on Tuesdays.”',
        },
      ],
      toneWords: ['ship', 'match', 'compatible', 'kickoff', 'your people', 'deadline-proof', 'no ghosters'],
      justification:
        'The audience is deadline-driven, skeptical of AI hype, and social by default. Energetic + warm earns attention in busy feeds; pragmatic + sharp earns trust under pressure; optimistic-without-hype keeps that trust when projects get hard. A corporate or hype-y voice would be instantly dismissed by the very students this product needs to convert.',
    },

    naming: {
      territories: [
        'Abstract names',
        'Descriptive names',
        'Metaphorical names',
        'Community-oriented names',
        'Technology-oriented names',
      ],
      options: [
        {
          id: 'nam_crest',
          name: 'Teampact',
          territory: 'Abstract names',
          meaning: 'A portmanteau of “team” and “impact” — a pact you make with your teammates to build something that matters.',
          reasoning:
            'Combines the social heart (team) with the outcome students actually want (impact). “Pact” adds a subtle commitment signal that matches the anti-ghosting promise.',
          brandFit: 'High — instantly evokes teams and outcomes, both core to the product.',
          pronunciation: 'TEEM-pact',
          personalityFit: 'Warm and sharp — feels like a promise, not a buzzword.',
          weakness: '“Pact” has a slightly legal/formal ring; needs energetic voice to balance it.',
          availabilityNote: 'No automatic domain/trademark verification performed.',
        },
        {
          id: 'nam_sync',
          name: 'Synavia',
          territory: 'Abstract names',
          meaning: 'Blends “synergy” with “via” — the route from many people to one flowing project.',
          reasoning: 'Smooth, modern, tech-adjacent abstract word that implies frictionless coordination.',
          brandFit: 'Medium — sounds innovative but less explicit about teams.',
          pronunciation: 'sin-AY-vee-uh',
          personalityFit: 'Energetic and optimistic, but slightly less grounded.',
          weakness: 'Abstract names need more storytelling to communicate what the product does.',
          availabilityNote: 'No automatic domain/trademark verification performed.',
        },
        {
          id: 'nam_aloft',
          name: 'Aloft',
          territory: 'Abstract names',
          meaning: 'High in the air — a project lifted off the ground by the team behind it.',
          reasoning: 'Short, memorable, evokes momentum and elevation (shipping).',
          brandFit: 'Medium — strong energy, weak direct teamwork signal.',
          pronunciation: 'uh-LOFT',
          personalityFit: 'Energetic and optimistic, headline-friendly.',
          weakness: 'Could suggest “away from campus life” rather than togetherness.',
          availabilityNote: 'No automatic domain/trademark verification performed.',
        },
        {
          id: 'nam_teamforge',
          name: 'TeamForge',
          territory: 'Descriptive names',
          meaning: 'A forge where raw people and ideas are hammered into a finished team.',
          reasoning: 'Literal and outcome-focused; “forge” implies transformation and hard work.',
          brandFit: 'High clarity — anyone understands it instantly.',
          pronunciation: 'TEEM-forj',
          personalityFit: 'Pragmatic and strong, slightly less warm.',
          weakness: 'Slightly generic; “*-forge” is a common startup suffix pattern.',
          availabilityNote: 'No automatic domain/trademark verification performed.',
        },
        {
          id: 'nam_matchup',
          name: 'MatchUp',
          territory: 'Descriptive names',
          meaning: 'The exact action the product performs: matching people up into teams.',
          reasoning: 'Maximum clarity; inherits the positive associations of matchmaking culture.',
          brandFit: 'Very high — the entire value proposition in one word.',
          pronunciation: 'MATCH-up',
          personalityFit: 'Energetic, playful, direct.',
          weakness: 'Less distinctive; many products use “match” language.',
          availabilityNote: 'No automatic domain/trademark verification performed.',
        },
        {
          id: 'nam_kickoff',
          name: 'Kickoff',
          territory: 'Descriptive names',
          meaning: 'The moment a project actually starts — and the product that gets you there.',
          reasoning: 'Sports-derived energy; names the micro-moment Teampact owns: team + first meeting.',
          brandFit: 'High — memorable and action-focused.',
          pronunciation: 'kik-OFF',
          personalityFit: 'Energetic and optimistic.',
          weakness: 'Sports-centric connotation may miss non-competitive contexts.',
          availabilityNote: 'No automatic domain/trademark verification performed.',
        },
        {
          id: 'nam_compass',
          name: 'Northbound',
          territory: 'Metaphorical names',
          meaning: 'Moving north — a project heading in the right direction as a group.',
          reasoning: 'Navigation metaphor fits a product that points you toward the right teammates.',
          brandFit: 'Medium-high — direction + journey imagery.',
          pronunciation: 'NORTH-bownd',
          personalityFit: 'Pragmatic and optimistic, directional.',
          weakness: 'No explicit teamwork signal; requires voice to connect the dots.',
          availabilityNote: 'No automatic domain/trademark verification performed.',
        },
        {
          id: 'nam_forge',
          name: 'Foundry',
          territory: 'Metaphorical names',
          meaning: 'A foundry pours raw material into a useful object — teams into shipped projects.',
          reasoning: 'Craftsmanship metaphor; implies transformation, quality and effort.',
          brandFit: 'Medium — strong, serious, slightly industrial.',
          pronunciation: 'FOWN-dree',
          personalityFit: 'Sharp and pragmatic; less playful.',
          weakness: 'Cold industrial connotation conflicts with the warm personality.',
          availabilityNote: 'No automatic domain/trademark verification performed.',
        },
        {
          id: 'nam_bloom',
          name: 'Kindling',
          territory: 'Metaphorical names',
          meaning: 'Small dry sticks that start a real fire — the spark that turns strangers into a burning idea.',
          reasoning: 'Growth + ignition metaphor; implies the product is the first spark.',
          brandFit: 'High for the warm personality — intimate and organic.',
          pronunciation: 'KIN-dling',
          personalityFit: 'Warm, optimistic, energetic — very on-voice.',
          weakness: 'Less credible for technical/career-focused messaging.',
          availabilityNote: 'No automatic domain/trademark verification performed.',
        },
        {
          id: 'nam_tribe',
          name: 'Tribe',
          territory: 'Community-oriented names',
          meaning: 'A tight group of people who look after each other and build together.',
          reasoning: 'Instant belonging signal; lean, memorable, human.',
          brandFit: 'High — community energy matches the social core.',
          pronunciation: 'tryb',
          personalityFit: 'Warm, direct, optimistic.',
          weakness: 'Common word; hard to own; mild cultural sensitivity.',
          availabilityNote: 'No automatic domain/trademark verification performed.',
        },
        {
          id: 'nam_circle',
          name: 'Circled',
          territory: 'Community-oriented names',
          meaning: 'A circle of people who have each other’s backs — a team drawn together.',
          reasoning: 'Geometric togetherness; “circled” adds motion — people pulled in.',
          brandFit: 'Medium-high — social and inclusive.',
          pronunciation: 'SUR-kuld',
          personalityFit: 'Warm and approachable.',
          weakness: '“Circle” is heavily used in social products.',
          availabilityNote: 'No automatic domain/trademark verification performed.',
        },
        {
          id: 'nam_overlap',
          name: 'Overlap',
          territory: 'Community-oriented names',
          meaning: 'The space where two people’s skills, schedules and goals intersect — the actual match.',
          reasoning: 'Names the core invention (the intersection) rather than the surface layer.',
          brandFit: 'High — distinctive and intellectually honest.',
          pronunciation: 'OH-vur-lap',
          personalityFit: 'Sharp and pragmatic, with a discreet warm core.',
          weakness: 'Sounds slightly technical/clinical on first read.',
          availabilityNote: 'No automatic domain/trademark verification performed.',
        },
        {
          id: 'nam_pulse',
          name: 'Pulse',
          territory: 'Technology-oriented names',
          meaning: 'The heartbeat of a project — live status, everyone in rhythm.',
          reasoning: 'Simple, tech-native, implies real-time coordination.',
          brandFit: 'Medium — modern but generic among SaaS names.',
          pronunciation: 'puls',
          personalityFit: 'Energetic and sharp.',
          weakness: '"Pulse" is saturated across health-tech and dashboards.',
          availabilityNote: 'No automatic domain/trademark verification performed.',
        },
        {
          id: 'nam_signal',
          name: 'Second Signal',
          territory: 'Technology-oriented names',
          meaning: 'Beyond the first impression — the deeper compatibility signal others miss.',
          reasoning: 'Positions the algorithm as seeing what simple signups cannot.',
          brandFit: 'High for the compatibility direction — smart and differentiated.',
          pronunciation: 'SEH-kund SIG-nul',
          personalityFit: 'Sharp, optimistic without hype.',
          weakness: 'Two words — slightly slower to say and to type.',
          availabilityNote: 'No automatic domain/trademark verification performed.',
        },
        {
          id: 'nam_node',
          name: 'NodeCrew',
          territory: 'Technology-oriented names',
          meaning: 'A node in the network of your people — a crew formed from the graph.',
          reasoning: 'Technical + social blend; network-graph imagery suits the matching engine.',
          brandFit: 'Medium-high — tech credibility with a human suffix.',
          pronunciation: 'nod-KROO',
          personalityFit: 'Warm and sharp, modern.',
          weakness: '“Crew” is casual; may read less professional to career services.',
          availabilityNote: 'No automatic domain/trademark verification performed.',
        },
      ],
      shortlisted: ['nam_crest', 'nam_sync', 'nam_kickoff', 'nam_kindling', 'nam_signal'],
      selectedId: 'nam_crest',
      whyThisName:
        'Teampact wins because it names both the heart (a team) and the promise (impact) of the product, with “pact” quietly promising commitment — the exact rebuttal to ghosting culture. It is short, distinctive among campus tools, and sounds equally good in a group chat, a hackathon sponsor deck and a university career-services portal. The energetic voice balances its slightly formal tail so it stays warm and sharp rather than corporate.',
    },

    messaging: {
      taglines: [
        'Find your people. Ship your project.',
        'Stop gambling on teammates.',
        'Deadline-proof teams, matched in minutes.',
        'The match that actually matters.',
      ],
      selectedTagline: 'Find your people. Ship your project.',
      oneLinePitch:
        'Teampact is the AI matchmaker that pairs college students into compatible, deadline-proof teams for projects and hackathons.',
      elevatorPitch:
        'Every group project starts with the same lottery: you ask around, pick anyone with a pulse, and pray. Teampact turns that lottery into a signal. Students set their skills, schedule and working style, and our compatibility engine surfaces the teammates who will actually make the project work — verified skills, no schedule clashes, aligned ambition. In minutes you go from alone to a team that scheduled its first meeting. No ghosters, no guesswork, no wasted semester.',
      valuePropositionStatement:
        'Teams built on compatibility, not luck — so your project actually ships.',
      keyMessage:
        'Teampact matches students into teams that are compatible on skills, schedule and working style — so fewer projects crash, and more ideas ship.',
      supportingMessages: [
        'Verifiable skills — paired on proof, not promises',
        'Schedule-synced teams — no more “when are you free?” ping-pong',
        'Compatible working styles — ambitious people with your rhythm',
        'From match to kickoff in minutes — channel, files and first meeting, handled',
      ],
      ctas: ['Build my team', 'Find your people', 'Start matching', 'Ship with Teampact'],
      rationale:
        'Messaging is anchored on the compatibility direction (the algorithm is the hero), voiced in the sharp-warm personality, and every line sells the outcome — teams that ship. The tagline was chosen for its YOLO-friendly energy and because it names the product’s two jobs: matching (“find your people”) and results (“ship your project”).',
    },

    visual: {
      concept:
        '“The campus wiring diagram” — a constellation of people as bright nodes, connected by threads of compatibility. Matching is shown as two nodes snapping together and sharing a glow. The system is beautiful but mechanical underneath: nodes, edges, signals.',
      conceptWhy:
        'The concept visually encodes the core invention (compatibility matching) instead of decoration. Students literally see themselves as nodes finding their threads — the metaphor of the product becomes the look of the brand.',
      colorDirection:
        'A twilight campus palette: deep violet-leaning inks ground the UI like a night sky, while a signal-yellow-thread and coral accents mark the “match” moments. The palette reads technical yet warm.',
      primaryColors: [
        { hex: '#6C5CE7', role: 'Signal Violet (primary)', why: 'The node color — the brand color; modern, smart, stands out in busy feeds.' },
        { hex: '#151326', role: 'Ink (base)', why: 'Night-sky grounding tone that makes the violet nodes and yellow threads glow; serious, premium.' },
        { hex: '#FFB02E', role: 'Match Thread (accent)', why: 'The yellow thread that connects two nodes when a match happens — the single most important micro-moment.' },
      ],
      secondaryColors: [
        { hex: '#FF6B6B', role: 'Alert Coral', why: 'Urgency for deadlines and “risk” states without feeling aggressive.' },
        { hex: '#2FD3A5', role: 'Verified Mint', why: 'Green check for verified skills and “healthy team” signals.' },
        { hex: '#EFEDF9', role: 'Haze', why: 'Soft violet haze for backgrounds — keeps the light UI friendly and approachable.' },
      ],
      typographyDirection:
        'A geometric, slightly technical display face for headlines (space-grotesk feel) paired with a highly legible humanist sans for body (inter feel). The display face carries the “systems + constellation” idea; the body keeps long copy digestible.',
      fonts: [
        { role: 'Display / headlines', name: 'Space Grotesk', why: 'Geometric with techy terminals — feels like a campus system, not a lifestyle brand.' },
        { role: 'Body / UI', name: 'Inter', why: 'Neutral, fast-reading, keeps structured output (scores, lists, cards) scannable.' },
        { role: 'Data / scores', name: 'JetBrains Mono', why: 'Compatibility scores and stats feel engineer-honest in a mono face.' },
      ],
      shapeLanguage:
        'Nodes and edges — circles for people, connecting arcs for compatibility, rounded-square cards for information. No sharp corners, no corporate boxes; everything is softly geometric and orbiting.',
      imageryStyle:
        'Abstract, high-contrast photographs of campus architecture at dusk, overlaid with glowing connection lines; real students pictured candidly mid-build (hackathon desks, whiteboards) — never stock-smiling-at-laptop.',
      iconography:
        '1px-outline geometric icons built from circles and arcs (orbit, node, thread). Consistent stroke weight, mono-aligned details; icons support, never decorate.',
      logoConcept:
        'Three intersecting rings that share a single glowing center — a team orbiting one shared outcome. In mono it prints as “interlocking orbits”; at match moments the shared center ignites in match-thread yellow.',
      compositionStyle:
        'Generous whitespace, cards on a soft haze background, score elements sitting in their own outlined panels, and every screen anchored by one glowing focal element (the match node).',
      mood: 'Electric but grounded — like a very good student lab at midnight: serious about the work, excited about what is being built.',
      avoid: [
        'Corporate blue gradients',
        'Overused AI purple-pink full-screen gradients',
        'Clip-art teamwork icons (puzzle pieces, handshakes)',
        'Stock-photo smiles on laptops',
        'Busy dashboards — every screen should have exactly one glowing focal point',
      ],
      whyFitsAudience:
        'The audience trusts systems: a visible node-and-thread metaphor reassures technical students the algorithm is transparent, while the warm twilight palette and candid campus imagery keep it human. Yellow-when-matched creates a reward moment engineered for the energetic, optimistic personality — every “snap” is a small dopamine win.',
    },

    critique: {
      summary:
        'The critic believes the brand is strong overall — the compatibility framing and “pact” concept are distinctive and internally consistent. It flags five issues worth resolving before launch, led by one real contradiction between the name’s formal tail and the energetic voice.',
      score: 82,
      strengths: [
        'Compatibility-first positioning is differentiated and defensible; nothing else scores team fit before commitment.',
        'Personality is sharp and specific with audience-justified reasoning.',
        'Visual concept directly encodes the product mechanism (nodes + match threads) rather than decorating it.',
        'Messaging consistently sells outcomes with concrete language (“deadline-proof”, “no ghosters”).',
      ],
      issues: [
        {
          id: 'crit_1',
          type: 'Contradiction',
          issue: 'The name “Teampact” carries a slightly formal/legal tail (“pact”), while the personality avoids corporate tones.',
          whyProblem: 'A formal-sounding name undermines the energetic, warm voice and creates perceptible dissonance in social-first channels.',
          evidence: 'Strengths analysis: “Pact has a slightly legal/formal ring; needs energetic voice to balance it.”',
          suggestion:
            'Lean the voice harder into warmth and energy in social copy (memes, kickoff rituals, GIFs) so the brand reads playful-with-a-promise, and keep “pact” as the serious core for institutional pages. Alternatively, pair the name with a more playful tagline than the current one.',
          severity: 'medium',
          status: 'open',
          target: {
            stage: 'messaging',
            path: 'rationale',
            value:
              'Messaging pairs the formal “pact” with deliberately warm, meme-native social voice (kickoff rituals, GIFs, inside jokes) so the brand reads playful-with-a-promise, while institutional pages keep a serious core.',
            label: 'Prefer warm social voice over formal name tone',
          },
        },
        {
          id: 'crit_2',
          type: 'Overused naming pattern',
          issue: 'Two shortlisted names (“Synavia”, “Kickoff”) follow overused startup patterns (abstract -ia suffix, sports-action verbs).',
          whyProblem: 'These weaken distinctiveness; shortlists should feel mined, not generated.',
          evidence: 'Naming pool shows territory grouping but several entries match common naming templates seen on every launch list.',
          suggestion:
            'Keep Teampact, kindling and Second Signal as the differentiated core (they encode meaning). Replace Synavia and Kickoff with less patterned options if the pool regenerates.',
          severity: 'low',
          status: 'open',
          target: {
            stage: 'naming',
            path: 'whyThisName',
            value:
              'The final shortlist deliberately favors names that encode meaning (Teampact = team + impact + pact, Kindling = the first spark, Second Signal = deeper compatibility) over template patterns such as -ia suffixes or sports-action verbs, to keep the brand distinctive.',
            label: 'Prioritize meaning-encoding names',
          },
        },
        {
          id: 'crit_3',
          type: 'Audience mismatch risk',
          issue: '“Second Signal” and “NodeCrew” skew technical and may alienate non-CS majors who form the broader audience.',
          whyProblem: 'The target audience includes design, business and humanities students; overly technical naming can read as “for engineers only.”',
          evidence: 'Discovery: target audience explicitly includes non-CS majors.',
          suggestion:
            'Keep the primary name (Teampact) broadly human, and gate technical vocabulary to developer/docs surfaces. Avoid technical names in student-facing campaign copy.',
          severity: 'medium',
          status: 'open',
          target: {
            stage: 'messaging',
            path: 'rationale',
            value:
              'Campaign copy keeps technical vocabulary on developer/docs surfaces only; student-facing messaging stays human and outcome-first so the brand welcomes design, business and humanities students equally.',
            label: 'Keep tech vocabulary off student-facing copy',
          },
        },
        {
          id: 'crit_4',
          type: 'Unsupported assumption',
          issue: 'The Discovery stage asserts students will adopt a dedicated tool, but no retention mechanism beyond the match moment is defined.',
          whyProblem: 'Post-match, the product has no obvious daily hook — matching is a one-time event per semester.',
          evidence: 'Goals/Constraints list no post-match retention loop or return trigger.',
          suggestion:
            'Add a lightweight post-match hook — a project “heartbeat” (weekly status, milestone celebrations, deadline countdown) — so matched teams have a reason to stay inside Teampact.',
          severity: 'high',
          status: 'open',
          target: {
            stage: 'discovery',
            path: 'goals',
            value:
              'Beyond matching speed, the product retains teams post-match with a project “heartbeat” — weekly status, milestone celebrations and deadline countdowns — turning match-day into an on-going team home.',
            label: 'Add post-match retention hook',
          },
        },
        {
          id: 'crit_5',
          type: 'Weak messaging pattern',
          issue: 'Two supporting messages use the phrase “no more/no ghosters” — negations are weaker than positive outcomes.',
          whyProblem: 'Negation copy (“no X”) tells people what to avoid, not what to gain; repeated negations read defensive.',
          evidence: 'Messaging.supportingMessages contains two negated framings.',
          suggestion:
            'Flip at least one to a positive frame: “Every teammate pre-vetted, every meeting pre-scheduled” instead of “no more ping-pong”.',
          severity: 'low',
          status: 'open',
          target: {
            stage: 'messaging',
            path: 'supportingMessages',
            value:
              'A positive reframe: “Every teammate pre-vetted, every meeting pre-scheduled, every ambitious person matched to the same project.”',
            label: 'Reframe negation to positive outcomes',
          },
        },
      ],
    },

    consistency: {
      status: 'attention',
      score: 87,
      summary:
        'Overall the brand reads as one system — the compatibility story threads through positioning, personality, naming, visuals and launch copy. The guardian flags two watch-items: a voice tonal clash between the formal name tail and the playful visual vibe, and a technical-vs-human vocabulary split in launch channels.',
      strengths: [
        'Name (Teampact), tagline (“Find your people. Ship your project.”) and positioning (compatibility-first) tell the same story: matching people to outcomes.',
        'The node-and-thread visual concept extends the “match” metaphor rather than inventing a parallel one.',
        'Launch copy consistently uses the direct, warm-sharp voice defined in the personality stage.',
        'Color system maps semantic meaning (violet=node, yellow=match thread, mint=verified) — no decorative randomness.',
      ],
      conflicts: [
        {
          id: 'con_1',
          components: ['Naming', 'Personality', 'Visual'],
          conflict: 'Naming carries a formal tail (“pact”) while visual mood and voice are playful-warm.',
          explanation:
            '“pact” nuances the brand toward commitment (good), but the visual/voice leans playful (match-thread yellow, kindling energy). Without care, institutional pages and launch tweets could sound like two different brands.',
          correction:
            'Adopt the brand tension deliberately: playful warmth in social/student surfaces, quiet commitment in institutional surfaces, and never mix them in one sentence.',
          severity: 'medium',
          status: 'open',
          target: {
            stage: 'personality',
            path: 'principles',
            value:
              'Adopt a deliberate two-surface tone: playful warmth in social/student surfaces, quiet commitment in institutional surfaces — never mixed in a single sentence.',
            label: 'Codify the warmth/commitment split',
          },
        },
        {
          id: 'con_2',
          components: ['Messaging', 'Audience'],
          conflict: 'Launch copy mixes meme-native energy with institutional vocabulary.',
          explanation:
            'Twitter/Instagram copy is playful, while the LinkedIn launch post and career-services messaging are conventional. That is partially correct (channel-appropriate), but the “elevator pitch” lands in between — too casual for institutions, too formal for students.',
          correction:
            'Rewrite the elevator pitch to split cleanly into two explicit variants: a 30-second student version and a 30-second institutional version.',
          severity: 'low',
          status: 'open',
          target: {
            stage: 'launch',
            path: 'productMessaging.elevatorPitch',
            value:
              'Split the pitch into two explicit variants: a student version (“match in minutes, ship in weeks — no ghosters”) and an institutional version (“verifiable skill graphs that reduce project failure and feed career services with evidence”).',
            label: 'Split elevator pitch into two audience variants',
          },
        },
      ],
    },

    launch: {
      landing: {
        heroHeadline: 'Find your people. Ship your project.',
        subheadline:
          'Teampact matches college students into compatible, deadline-proof teams for projects and hackathons — skills, schedule and working style, verified before you commit.',
        cta: 'Build my team',
        features: [
          {
            title: 'Compatibility, not coincidence',
            description: 'A transparent match score weighs skills, schedule and working style so you stop gambling on teammates.',
          },
          {
            title: 'Verified skills',
            description: 'Profiles carry portfolio proof, not just bullet points — paired on evidence, not promises.',
          },
          {
            title: 'From match to kickoff in minutes',
            description: 'Shared channel, files and a pre-arranged first meeting — the boring part is automated.',
          },
          {
            title: 'No more schedule ping-pong',
            description: 'Clash detection up front means fewer “when are you free?” threads and more building.',
          },
        ],
        about:
          'Teampact started with a very simple observation: most student projects don’t die from bad ideas, they die from bad teams. We built a matching engine that treats finding a teammate like the serious decision it is — pairing students on the signals that actually predict a shipped project: skills you can prove, schedules you can trust, and ambition that lines up.',
      },
      social: {
        launchPost:
          '🚀 We built the teammate matchmaker we wish existed.\n\nEvery group project starts with a lottery. You ask around, pick anyone, pray. We replaced that lottery with a compatibility score — skills, schedule and working style, verified before you commit.\n\nTeampact is live. Find your people. Ship your project.\n\nteampact.app #hackathon #students #buildinpublic',
        shortAnnouncement:
          'Announcing Teampact — the AI matchmaker that pairs students into compatible, deadline-proof teams. 💜\n\nMatch on skills, schedule & working style. Verified skills. Kickoff in minutes.\n\ntry it → teampact.app',
        twitter:
          'stop gambling on teammates 🎲❌\n\nteampact matches you on skills, schedule + working style — verified before you commit.\n\nmatch in minutes. ship in weeks.\n\nteampact.app',
        linkedin:
          'Most student projects don’t fail because the idea was weak — they fail because the team was a gamble.\n\nAt Teampact we built a matching engine that scores compatibility across verified skills, availability and working style, turning the group-project lottery into a decision students can trust.\n\nFor universities and hackathon organizers, that means fairer teams, fewer failed projects, and a skill graph that feeds career services with real evidence.\n\nWe’re live at campuses this semester. Proud of the team that shipped this. 🚀 #edtech #hackathons #futureofwork',
        instagram:
          'your people are out there 🫶✨\n\nmeet your next teammate on teampact — matched on skills, schedule + working style, so every project actually ships 🚀\n\nlink in bio → find your people 💜💛',
      },
      productMessaging: {
        appDescription:
          'Teampact is the AI-powered teammate matchmaker for college students. Set your skills, schedule and working style — then get matched with compatible partners for projects and hackathons. Verified skills, schedule-sync, and a kickoff that happens in minutes. Stop gambling on teammates, start shipping.',
        shortDescription:
          'AI teammate matching for students — compatible, deadline-proof teams in minutes.',
        elevatorPitch:
          'Every group project starts with the same lottery: you ask around, pick anyone with a pulse, and pray. Teampact turns that lottery into a signal. Students set their skills, schedule and working style, and our compatibility engine surfaces the teammates who will actually make the project work — verified skills, no schedule clashes, aligned ambition. In minutes you go from alone to a team that scheduled its first meeting. No ghosters, no guesswork, no wasted semester.',
        appStoreDescription:
          'The group-project lottery ends here.\n\nTeampact matches you with teammates who fit — verified skills, compatible schedules, aligned ambition. Join a team or build your own, then move to kickoff in minutes with a shared channel, files and a pre-arranged first meeting.\n\n• Compatibility score you can see and trust\n• Skill profiles with portfolio proof\n• Schedule clash detection built in\n• For projects, hackathons and anything worth shipping',
      },
    },
  };
}

export function buildDemoProject(): Project {
  const now = new Date().toISOString();
  const st = stages();
  const prompts: Record<string, { model: string; prompt: string; reasoning: string[] }> = {
    discovery: {
      model: 'demo-sample',
      prompt:
        'SYSTEM: You are the Discovery Agent. Distill the rough idea into structured facts (core idea, problem, audience, needs, context, goals, constraints, value, open questions, assumptions). Ask clarifying questions ONLY if critical facts are missing.\nUSER: ' +
        DEMO_IDEA,
      reasoning: [
        'Detected a concrete audience (college students) and a concrete pain (finding teammates).',
        'Identified the matchmaking metaphor as the strongest framing for this audience.',
        'Open questions preserved so the founder keeps ownership of strategic unknowns.',
      ],
    },
    positioning: {
      model: 'demo-sample',
      prompt:
        'SYSTEM: You are the Positioning Agent. Generate 3 strategically DIFFERENT directions using the discovery context. Each needs a distinct angle, value proposition, differentiator, reasons to believe and fit scores.\nCONTEXT: discovery=' +
        JSON.stringify(st.discovery),
      reasoning: [
        'Built three directions around three genuinely different strategic bets: the match moment (compatibility), the network (community), and the evidence trail (skill).',
        'Compatibility-first scored highest on differentiation and clarity for this audience.',
      ],
    },
    personality: {
      model: 'demo-sample',
      prompt:
        'SYSTEM: You are the Brand Personality Agent. Define traits, voice, principles and communication style, justifying each against the target audience and positioning.\nCONTEXT: discovery + positioning (compatibility-first)',
      reasoning: [
        'Energetic + warm earns attention in busy campus feeds; pragmatic + sharp earns trust under deadline pressure.',
        'Explicitly avoids corporate and hype-y tones that a skeptical technical audience rejects.',
      ],
    },
    naming: {
      model: 'demo-sample',
      prompt:
        'SYSTEM: You are the Naming Agent. Generate names inside 5 territories. Every name needs meaning, reasoning, fit, pronunciation, personality fit and weaknesses. Never claim domain/trademark availability.\nCONTEXT: personality + positioning + audience',
      reasoning: [
        'Generated in territories so names diversify across naming strategies instead of clustering.',
        'Teampact selected for encoding both the heart (team) and the promise (impact/pact).',
      ],
    },
    messaging: {
      model: 'demo-sample',
      prompt:
        'SYSTEM: You are the Messaging Agent. Write taglines, pitches, key messages and CTAs strictly within the selected positioning, personality and name. Do not regenerate strategy independently.\nCONTEXT: positioning=compatibility-first, personality=energetic-pragmatic-warm-sharp, name=Teampact',
      reasoning: [
        'The tagline names the two jobs: matching (find your people) and results (ship your project).',
        'Every supporting message sells an outcome with concrete vocabulary.',
      ],
    },
    visual: {
      model: 'demo-sample',
      prompt:
        'SYSTEM: You are the Visual Strategy Agent. Produce a structured visual brief where EVERY decision (color, type, shape, imagery, logo) is justified against the audience, personality and positioning.\nCONTEXT: personality + positioning + audience',
      reasoning: [
        'The node-and-thread concept encodes the matching mechanism itself — the algorithm is the visual hero.',
        'Semantic color mapping (violet=node, yellow=match) means no decorative randomness.',
      ],
    },
    critique: {
      model: 'demo-sample',
      prompt:
        'SYSTEM: You are the independent Brand Critic. Challenge every prior stage. Do not approve blindly. For every issue show: issue → why it is a problem → evidence → suggested improvement.\nCONTEXT: discovery, positioning, personality, naming, messaging, visual',
      reasoning: [
        'Flagged the name-tail vs voice dissonance as the highest-signal fix.',
        'Criticized the missing post-match retention loop — the strongest strategic gap.',
        '40% of issues were low-severity polish, keeping the critique honest rather than performative.',
      ],
    },
    consistency: {
      model: 'demo-sample',
      prompt:
        'SYSTEM: You are the Consistency Guardian. Compare name, positioning, personality, tagline, messaging, visual direction and launch content. Return status, score, conflicts with corrections and strengths.\nCONTEXT: all stages + launch',
      reasoning: [
        'Confirmed the compatibility thread runs through every stage — one brand system.',
        'Flagged the warmth/commitment split as a deliberate-but-managed tension.',
      ],
    },
    launch: {
      model: 'demo-sample',
      prompt:
        'SYSTEM: You are the Launch Generator. Produce landing, social and product-messaging copy strictly on-brand (positioning, personality, name, visual language).\nCONTEXT: full brand system',
      reasoning: [
        'Channel-specific copy: meme-native for Twitter/Instagram, credible for LinkedIn and app stores.',
        'Every asset opens with a concrete outcome rather than brand fluff.',
      ],
    },
  };

  const insights: Project['insights'] = {};
  for (const key of Object.keys(prompts) as (keyof typeof prompts)[]) {
    insights[key as keyof typeof insights] = insight(
      prompts[key].model,
      prompts[key].prompt,
      prompts[key].reasoning,
    );
  }

  return {
    id: makeId('prj'),
    name: 'Teampact',
    idea: DEMO_IDEA,
    createdAt: now,
    updatedAt: now,
    isDemo: true,
    activeStage: 'positioning',
    insights,
    discoverySession: { questions: [], answers: {}, askedAt: null },
    stages: st,
  };
}