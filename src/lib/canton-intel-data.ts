import { participants, type Participant } from './canton-data';

// ── Interfaces ──────────────────────────────────────────

export interface IntelEvent {
  id: string;
  name: string;
  type: 'Conference' | 'Summit' | 'Working Group' | 'Industry Day' | 'Hackathon' | 'Roadshow';
  startDate: string;
  endDate: string;
  location: string;
  venue?: string;
  attendeeCap?: number;
  applicationRequired: boolean;
  cantonRelevance: 'High' | 'Medium' | 'Low';
  cantonSpeakerIds: string[];
  cantonOrgIds: string[];
  topicsCovered: string[];
  sourceUrl?: string;
  notes?: string;
  flowrydAttended: boolean;
  flowrydSpeaking: boolean;
  followUpActions?: string;
  lat?: number;
  lng?: number;
}

export interface IntelPerson {
  id: string;
  fullName: string;
  currentRole: string;
  organizationId: string;
  cantonRoles: string[];
  linkedinUrl?: string;
  twitterHandle?: string;
  eventIds: string[];
  mediaIds: string[];
  relationshipToFlowryd: 'None' | 'Warm' | 'Connected' | 'Partner';
  introducedById?: string;
  lastContactDate?: string;
  notes?: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface IntelMedia {
  id: string;
  title: string;
  mediaType: 'Podcast' | 'Interview' | 'Webinar' | 'Article' | 'Research Report' | 'Video';
  publisher: string;
  seriesName?: string;
  publicationDate: string;
  durationMinutes?: number;
  cantonSpeakerIds: string[];
  cantonOrgIds: string[];
  topicsCovered: string[];
  keyQuotes?: string;
  cantonMentions: boolean;
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  sourceUrl?: string;
  transcriptAvailable: boolean;
  strategicInsights?: string;
}

// ── Mock Data ───────────────────────────────────────────

export const intelEvents: IntelEvent[] = [
  {
    id: 'evt-2026-001',
    name: 'CfC St. Moritz 2026',
    type: 'Conference',
    startDate: '2026-01-14T09:00:00Z',
    endDate: '2026-01-16T18:00:00Z',
    location: 'St. Moritz, Switzerland',
    venue: 'Suvretta House',
    attendeeCap: 250,
    applicationRequired: true,
    cantonRelevance: 'High',
    cantonSpeakerIds: ['per-001', 'per-002', 'per-003', 'per-004', 'per-005', 'per-006', 'per-007'],
    cantonOrgIds: ['p_drw', 'p_da', 'p_franklin', 'p_dtcc', 'p_kaiko', 'p_talos', 'p_chainlink', 'p_hidden_road'],
    topicsCovered: ['Tokenization', 'Regulation', 'Institutional Adoption', 'ETFs'],
    sourceUrl: 'https://cfc-stmoritz.com',
    notes: 'Inner circle meeting. Pre-Davos positioning. Don Wilson + Jenny Johnson in same room.',
    flowrydAttended: false,
    flowrydSpeaking: false,
    followUpActions: 'Apply for 2027 (applications open Oct 2026). Reach out to Kaiko/Talos for intro.',
    lat: 46.4974,
    lng: 9.8385,
  },
];

export const intelPeople: IntelPerson[] = [
  {
    id: 'per-001',
    fullName: 'Don Wilson',
    currentRole: 'Founder & CEO',
    organizationId: 'p_drw',
    cantonRoles: ['Investor', 'Board', 'SV'],
    eventIds: ['evt-2026-001'],
    mediaIds: [],
    relationshipToFlowryd: 'None',
    priority: 'High',
    notes: 'THE Canton kingpin. $206M CC. Controls Cumberland. DA Board.',
  },
  {
    id: 'per-002',
    fullName: 'Jenny Johnson',
    currentRole: 'CEO',
    organizationId: 'p_franklin',
    cantonRoles: ['Investor'],
    eventIds: ['evt-2026-001'],
    mediaIds: ['med-2026-001'],
    relationshipToFlowryd: 'None',
    priority: 'High',
    notes: '$1.69T AUM. Benji on Canton. Key ETF issuer target.',
  },
  {
    id: 'per-003',
    fullName: 'Yuval Rooz',
    currentRole: 'CEO',
    organizationId: 'p_da',
    cantonRoles: ['Founder', 'Board'],
    eventIds: ['evt-2026-001'],
    mediaIds: ['med-2026-003'],
    relationshipToFlowryd: 'None',
    priority: 'High',
    notes: 'Co-founder of Digital Asset. Canton creator. Key network decision maker.',
  },
  {
    id: 'per-004',
    fullName: 'Talia Klein',
    currentRole: 'Managing Director, Digital Assets',
    organizationId: 'p_dtcc',
    cantonRoles: ['Infrastructure Lead'],
    eventIds: ['evt-2026-001'],
    mediaIds: ['med-2026-002'],
    relationshipToFlowryd: 'None',
    priority: 'High',
    notes: 'Leads DTCC digital asset strategy. Key infrastructure decision maker.',
  },
  {
    id: 'per-005',
    fullName: 'Ambre Soubiran',
    currentRole: 'CEO',
    organizationId: 'p_kaiko',
    cantonRoles: ['Data Provider'],
    eventIds: ['evt-2026-001'],
    mediaIds: [],
    relationshipToFlowryd: 'None',
    priority: 'Medium',
    notes: 'Leading crypto data provider. Could be intro path to larger Canton players.',
  },
  {
    id: 'per-006',
    fullName: 'Anton Katz',
    currentRole: 'CEO',
    organizationId: 'p_talos',
    cantonRoles: ['Trading Infrastructure'],
    eventIds: ['evt-2026-001'],
    mediaIds: [],
    relationshipToFlowryd: 'None',
    priority: 'Medium',
    notes: 'Institutional trading tech. Strategic partnership potential.',
  },
  {
    id: 'per-007',
    fullName: 'Fernando Vázquez Cao',
    currentRole: 'Head of Blockchain Engineering',
    organizationId: 'p_chainlink',
    cantonRoles: ['Oracle Provider'],
    eventIds: ['evt-2026-001'],
    mediaIds: [],
    relationshipToFlowryd: 'None',
    priority: 'Medium',
    notes: 'Chainlink integration with Canton. Oracle infrastructure.',
  },
];

export const intelMedia: IntelMedia[] = [
  {
    id: 'med-2026-001',
    title: 'Tokenizing the Future of ETFs',
    mediaType: 'Podcast',
    publisher: 'Blockworks',
    seriesName: 'On The Margin',
    publicationDate: '2026-01-15T10:00:00Z',
    durationMinutes: 45,
    cantonSpeakerIds: ['per-002'],
    cantonOrgIds: ['p_franklin'],
    topicsCovered: ['ETFs', 'Tokenization', 'Canton'],
    keyQuotes: '"Money market funds qualify as collateral on Canton — this changes the game for institutional liquidity."',
    cantonMentions: true,
    sentiment: 'Bullish',
    sourceUrl: 'https://blockworks.co/podcast/on-the-margin',
    transcriptAvailable: true,
    strategicInsights: 'Franklin Templeton focusing on collateral use case. Benji fund already live on Canton. Signals deeper integration coming.',
  },
  {
    id: 'med-2026-002',
    title: 'Canton Network: Institutional DeFi Infrastructure',
    mediaType: 'Article',
    publisher: 'CoinDesk',
    publicationDate: '2026-01-10T14:00:00Z',
    cantonSpeakerIds: ['per-004'],
    cantonOrgIds: ['p_dtcc', 'p_da'],
    topicsCovered: ['Infrastructure', 'Settlement', 'Interoperability'],
    keyQuotes: '"DTCC sees Canton as the connective tissue between traditional and digital asset markets."',
    cantonMentions: true,
    sentiment: 'Bullish',
    sourceUrl: 'https://coindesk.com/business/canton-network-institutional-defi',
    transcriptAvailable: false,
    strategicInsights: 'DTCC + Digital Asset partnership deepening. Post-trade infrastructure modernization accelerating.',
  },
  {
    id: 'med-2026-003',
    title: 'The Future of Post-Trade Infrastructure',
    mediaType: 'Webinar',
    publisher: 'Digital Asset',
    publicationDate: '2026-01-20T16:00:00Z',
    durationMinutes: 60,
    cantonSpeakerIds: ['per-003'],
    cantonOrgIds: ['p_da', 'p_dtcc', 'p_broadridge'],
    topicsCovered: ['Post-Trade', 'Smart Contracts', 'Daml', 'Canton'],
    keyQuotes: '"Canton enables atomic settlement across previously siloed market infrastructures."',
    cantonMentions: true,
    sentiment: 'Bullish',
    sourceUrl: 'https://digitalasset.com/webinars/post-trade-future',
    transcriptAvailable: true,
    strategicInsights: 'Yuval Rooz laying out Canton roadmap. Broadridge integration highlighted as key milestone.',
  },
];

// ── Helper Functions ────────────────────────────────────

export function getPersonById(id: string): IntelPerson | undefined {
  return intelPeople.find(p => p.id === id);
}

export function getEventById(id: string): IntelEvent | undefined {
  return intelEvents.find(e => e.id === id);
}

export function getMediaById(id: string): IntelMedia | undefined {
  return intelMedia.find(m => m.id === id);
}

export function getOrgById(id: string): Participant | undefined {
  return participants.find(p => p.id === id);
}

export function getPeopleForEvent(eventId: string): IntelPerson[] {
  return intelPeople.filter(p => p.eventIds.includes(eventId));
}

export function getMediaForPerson(personId: string): IntelMedia[] {
  return intelMedia.filter(m => m.cantonSpeakerIds.includes(personId));
}

export function getEventsForPerson(personId: string): IntelEvent[] {
  return intelEvents.filter(e => e.cantonSpeakerIds.includes(personId));
}

export function getOrgsForEvent(eventId: string): Participant[] {
  const event = getEventById(eventId);
  if (!event) return [];
  return event.cantonOrgIds
    .map(id => participants.find(p => p.id === id))
    .filter((p): p is Participant => p !== undefined);
}
