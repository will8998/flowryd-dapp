// ── Airtable Configuration ──────────────────────────────────────

export interface AirtableConfig {
  pat: string;
  baseId: string;
  tables: {
    events: string;
    people: string;
    media: string;
    announcements: string;
  };
}

// ── Airtable Base Types ─────────────────────────────────────────

export interface AirtableAttachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  thumbnails?: {
    small: { url: string; width: number; height: number };
    large: { url: string; width: number; height: number };
    full: { url: string; width: number; height: number };
  };
}

export interface AirtableRecord<T> {
  id: string;
  createdTime: string;
  fields: T;
}

export interface AirtableResponse<T> {
  records: AirtableRecord<T>[];
  offset?: string;
}

// ── Airtable Field Mappings ────────────────────────────────────

export interface AirtableEventFields {
  Name: string;
  Description?: string;
  StartDate: string;
  EndDate?: string;
  Location?: string;
  Venue?: string;
  Type?: string;
  Status?: string;
  CantonRelevance?: string;
  CantonSpeakerIds?: string[];
  CantonOrgIds?: string[];
  TopicsCovered?: string[];
  SourceUrl?: string;
  Notes?: string;
  FlowrydAttended?: boolean;
  FlowrydSpeaking?: boolean;
  FollowUpActions?: string;
  AttendeeCap?: number;
  ApplicationRequired?: boolean;
  Lat?: number;
  Lng?: number;
}

export interface AirtablePersonFields {
  FullName: string;
  CurrentRole?: string;
  OrganizationId?: string;
  Organization?: string;
  CantonRoles?: string[];
  LinkedinUrl?: string;
  TwitterHandle?: string;
  EventIds?: string[];
  MediaIds?: string[];
  RelationshipToFlowryd?: string;
  IntroducedById?: string;
  LastContactDate?: string;
  Notes?: string;
  Priority?: string;
  Avatar?: AirtableAttachment[];
}

export interface AirtableMediaFields {
  Title: string;
  MediaType?: string;
  Publisher?: string;
  SeriesName?: string;
  PublicationDate?: string;
  DurationMinutes?: number;
  CantonSpeakerIds?: string[];
  CantonOrgIds?: string[];
  TopicsCovered?: string[];
  KeyQuotes?: string;
  CantonMentions?: boolean;
  Sentiment?: string;
  SourceUrl?: string;
  TranscriptAvailable?: boolean;
  StrategicInsights?: string;
}

export interface AirtableAnnouncementFields {
  Title?: string;
  Date?: string;
  Participants?: string[];
  Type?: string;
  Description?: string;
  SourceUrl?: string;
  Impact?: string;
  Notes?: string;
}

// ── Fetch Options ───────────────────────────────────────────────

export interface AirtableFetchOptions {
  revalidate?: number;
  offset?: string;
  maxRecords?: number;
  sort?: Array<{
    field: string;
    direction: 'asc' | 'desc';
  }>;
  filterByFormula?: string;
}