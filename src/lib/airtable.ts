import {
  type AirtableConfig,
  type AirtableRecord,
  type AirtableResponse,
  type AirtableEventFields,
  type AirtablePersonFields,
  type AirtableMediaFields,
  type AirtableAnnouncementFields,
  type AirtableFetchOptions,
} from '@/types/airtable';
import {
  type IntelEvent,
  type IntelPerson,
  type IntelMedia,
  type IntelAnnouncement,
  intelEvents,
  intelPeople,
  intelMedia,
  intelAnnouncements,
} from './canton-intel-data';

// ── Configuration ───────────────────────────────────────────────

export function getAirtableConfig(): AirtableConfig | null {
  const pat = process.env.AIRTABLE_PAT;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const eventsTable = process.env.AIRTABLE_TABLE_EVENTS;
  const peopleTable = process.env.AIRTABLE_TABLE_PEOPLE;
  const mediaTable = process.env.AIRTABLE_TABLE_MEDIA;
  const announcementsTable = process.env.AIRTABLE_TABLE_ANNOUNCEMENTS;

  if (!pat || !baseId || !eventsTable || !peopleTable || !mediaTable || !announcementsTable) {
    return null;
  }

  return {
    pat,
    baseId,
    tables: {
      events: eventsTable,
      people: peopleTable,
      media: mediaTable,
      announcements: announcementsTable,
    },
  };
}

export function isAirtableConfigured(): boolean {
  return getAirtableConfig() !== null;
}

// ── Generic Airtable Fetch ──────────────────────────────────────

async function fetchAirtableTable<T>(
  tableName: string,
  options: AirtableFetchOptions = {}
): Promise<AirtableRecord<T>[]> {
  const config = getAirtableConfig();
  if (!config) {
    throw new Error('Airtable not configured');
  }

  const { revalidate = 300, offset, maxRecords = 100, sort, filterByFormula } = options;

  // Build query parameters
  const params = new URLSearchParams();
  if (offset) params.append('offset', offset);
  if (maxRecords !== 100) params.append('maxRecords', maxRecords.toString());
  if (sort) {
    sort.forEach((s) => {
      params.append('sort[0][field]', s.field);
      params.append('sort[0][direction]', s.direction);
    });
  }
  if (filterByFormula) params.append('filterByFormula', filterByFormula);

  const url = `https://api.airtable.com/v0/${config.baseId}/${tableName}?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.pat}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate },
  });

  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
  }

  const data: AirtableResponse<T> = await response.json();
  
  // Handle pagination - fetch all records if there's an offset
  let allRecords = data.records;
  let nextOffset = data.offset;

  while (nextOffset) {
    const nextParams = new URLSearchParams(params);
    nextParams.set('offset', nextOffset);
    
    const nextUrl = `https://api.airtable.com/v0/${config.baseId}/${tableName}?${nextParams.toString()}`;
    const nextResponse = await fetch(nextUrl, {
      headers: {
        Authorization: `Bearer ${config.pat}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate },
    });

    if (!nextResponse.ok) {
      console.warn(`Failed to fetch additional records: ${nextResponse.status}`);
      break;
    }

    const nextData: AirtableResponse<T> = await nextResponse.json();
    allRecords = [...allRecords, ...nextData.records];
    nextOffset = nextData.offset;
  }

  return allRecords;
}

// ── Data Mapping Functions ──────────────────────────────────────

function mapAirtableEventToIntelEvent(record: AirtableRecord<AirtableEventFields>): IntelEvent {
  const fields = record.fields;
  
  return {
    id: record.id,
    name: fields.Name,
    type: (fields.Type as IntelEvent['type']) || 'Conference',
    startDate: fields.StartDate,
    endDate: fields.EndDate || fields.StartDate,
    location: fields.Location || '',
    venue: fields.Venue,
    attendeeCap: fields.AttendeeCap,
    applicationRequired: fields.ApplicationRequired || false,
    cantonRelevance: (fields.CantonRelevance as IntelEvent['cantonRelevance']) || 'Low',
    cantonSpeakerIds: fields.CantonSpeakerIds || [],
    cantonOrgIds: fields.CantonOrgIds || [],
    topicsCovered: fields.TopicsCovered || [],
    sourceUrl: fields.SourceUrl,
    notes: fields.Notes,
    flowrydAttended: fields.FlowrydAttended || false,
    flowrydSpeaking: fields.FlowrydSpeaking || false,
    followUpActions: fields.FollowUpActions,
    lat: fields.Lat,
    lng: fields.Lng,
  };
}

function mapAirtablePersonToIntelPerson(record: AirtableRecord<AirtablePersonFields>): IntelPerson {
  const fields = record.fields;
  
  return {
    id: record.id,
    fullName: fields.FullName,
    currentRole: fields.CurrentRole || '',
    organizationId: fields.OrganizationId || '',
    organization: fields.Organization || '',
    cantonRoles: fields.CantonRoles || [],
    linkedinUrl: fields.LinkedinUrl,
    twitterHandle: fields.TwitterHandle,
    eventIds: fields.EventIds || [],
    mediaIds: fields.MediaIds || [],
    relationshipToFlowryd: (fields.RelationshipToFlowryd as IntelPerson['relationshipToFlowryd']) || 'None',
    introducedById: fields.IntroducedById,
    lastContactDate: fields.LastContactDate,
    notes: fields.Notes,
    priority: (fields.Priority as IntelPerson['priority']) || 'Low',
  };
}

function mapAirtableMediaToIntelMedia(record: AirtableRecord<AirtableMediaFields>): IntelMedia {
  const fields = record.fields;
  
  return {
    id: record.id,
    title: fields.Title,
    mediaType: (fields.MediaType as IntelMedia['mediaType']) || 'Article',
    publisher: fields.Publisher || '',
    seriesName: fields.SeriesName,
    publicationDate: fields.PublicationDate || '',
    durationMinutes: fields.DurationMinutes,
    cantonSpeakerIds: fields.CantonSpeakerIds || [],
    cantonOrgIds: fields.CantonOrgIds || [],
    topicsCovered: fields.TopicsCovered || [],
    keyQuotes: fields.KeyQuotes,
    cantonMentions: fields.CantonMentions || false,
    sentiment: (fields.Sentiment as IntelMedia['sentiment']) || 'Neutral',
    sourceUrl: fields.SourceUrl,
    transcriptAvailable: fields.TranscriptAvailable || false,
    strategicInsights: fields.StrategicInsights,
  };
}

function mapAirtableAnnouncementToIntelAnnouncement(record: AirtableRecord<AirtableAnnouncementFields>): IntelAnnouncement {
  const fields = record.fields;
  
  return {
    id: record.id,
    date: fields.Date || '',
    participants: fields.Participants || [],
    type: fields.Type || '',
    description: fields.Description || '',
    sourceUrl: fields.SourceUrl,
    impact: (fields.Impact as IntelAnnouncement['impact']) || 'Low',
    notes: fields.Notes,
  };
}

// ── Public Fetch Functions ──────────────────────────────────────

export async function fetchEvents(options?: AirtableFetchOptions): Promise<IntelEvent[]> {
  if (!isAirtableConfigured()) {
    console.log('Airtable not configured, returning mock events data');
    return intelEvents;
  }

  try {
    const config = getAirtableConfig()!;
    const records = await fetchAirtableTable<AirtableEventFields>(config.tables.events, options);
    return records.map(mapAirtableEventToIntelEvent);
  } catch (error) {
    console.error('Failed to fetch events from Airtable:', error);
    console.log('Falling back to mock events data');
    return intelEvents;
  }
}

export async function fetchPeople(options?: AirtableFetchOptions): Promise<IntelPerson[]> {
  if (!isAirtableConfigured()) {
    console.log('Airtable not configured, returning mock people data');
    return intelPeople;
  }

  try {
    const config = getAirtableConfig()!;
    const records = await fetchAirtableTable<AirtablePersonFields>(config.tables.people, options);
    return records.map(mapAirtablePersonToIntelPerson);
  } catch (error) {
    console.error('Failed to fetch people from Airtable:', error);
    console.log('Falling back to mock people data');
    return intelPeople;
  }
}

export async function fetchMedia(options?: AirtableFetchOptions): Promise<IntelMedia[]> {
  if (!isAirtableConfigured()) {
    console.log('Airtable not configured, returning mock media data');
    return intelMedia;
  }

  try {
    const config = getAirtableConfig()!;
    const records = await fetchAirtableTable<AirtableMediaFields>(config.tables.media, options);
    return records.map(mapAirtableMediaToIntelMedia);
  } catch (error) {
    console.error('Failed to fetch media from Airtable:', error);
    console.log('Falling back to mock media data');
    return intelMedia;
  }
}

export async function fetchAnnouncements(options?: AirtableFetchOptions): Promise<IntelAnnouncement[]> {
  if (!isAirtableConfigured()) {
    console.log('Airtable not configured, returning mock announcements data');
    return intelAnnouncements;
  }

  try {
    const config = getAirtableConfig()!;
    const records = await fetchAirtableTable<AirtableAnnouncementFields>(config.tables.announcements, options);
    return records.map(mapAirtableAnnouncementToIntelAnnouncement);
  } catch (error) {
    console.error('Failed to fetch announcements from Airtable:', error);
    console.log('Falling back to mock announcements data');
    return intelAnnouncements;
  }
}