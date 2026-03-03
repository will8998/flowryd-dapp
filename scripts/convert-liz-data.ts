/**
 * Liz's FLOWRYDDATA CSV → TypeScript Conversion Script
 * 
 * Reads all CSVs from /Users/williamlee/Desktop/FLOWRYDDATA/
 * and generates updated TypeScript data files for the Flowryd platform.
 * 
 * Run: npx tsx scripts/convert-liz-data.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { join } from 'path';

const DATA_DIR = '/Users/williamlee/Desktop/FLOWRYDDATA';
const SRC_DIR = join(__dirname, '..', 'src', 'lib');

// ── CSV Parsing Helpers ──────────────────────────────────

function readCSV(filename: string): Record<string, string>[] {
  const content = readFileSync(join(DATA_DIR, filename), 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });
}

function esc(s: string): string {
  if (!s) return '';
  return s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

function toNumber(s: string): number {
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function toBool(s: string): boolean {
  return s === '1' || s === 'true' || s === 'True' || s === 'Yes' || s === 'yes';
}

// ── Read existing canton-data.ts for lat/lng preservation ──

function readExistingLatLng(): Map<string, { lat: number; lng: number }> {
  const map = new Map<string, { lat: number; lng: number }>();
  try {
    const content = readFileSync(join(SRC_DIR, 'canton-data.ts'), 'utf-8');
    // Parse existing lat/lng from the file using regex
    const idRegex = /id:\s*["']([^"']+)["']/g;
    const latRegex = /lat:\s*([-\d.]+)/g;
    const lngRegex = /lng:\s*([-\d.]+)/g;
    
    // Split by participant blocks
    const blocks = content.split(/\{[\s\n]*id:/g);
    for (const block of blocks) {
      const idMatch = block.match(/["']([^"']+)["']/);
      const latMatch = block.match(/lat:\s*([-\d.]+)/);
      const lngMatch = block.match(/lng:\s*([-\d.]+)/);
      if (idMatch && latMatch && lngMatch) {
        map.set(idMatch[1], {
          lat: parseFloat(latMatch[1]),
          lng: parseFloat(lngMatch[1]),
        });
      }
    }
  } catch (e) {
    console.warn('Could not read existing canton-data.ts for lat/lng:', e);
  }
  return map;
}

// ── CAPABILITY COLUMNS from Participants.csv ──────────────

const CAPABILITY_COLUMNS = [
  'Custody', 'Settlement', 'Registry', 'Issuer', 'Exchange', 'Compliance',
  'Wallet', 'Stablecoin', 'Bridge', 'Collateral_Agent', 'Collateral_Provider',
  'Collateral_Taker', 'Cash_Lender', 'Repo_Platform', 'Liquidity_Provider',
  'Market_Maker', 'Valuation_Pricing', 'Data_Oracle', 'Identity_Provider',
  'Payment', 'Infrastructure', 'Staking', 'Transfer_Agent', 'DEX',
  'Dev_Tooling', 'Prediction_Markets', 'Orchestration', 'Data_Visualization',
  'ETF_Workflow', 'MMF_Workflow', 'DeFi'
];

// ── TRANSFORM: Participants.csv → canton-data.ts ──────────

function transformParticipants() {
  console.log('Reading Participants.csv...');
  const rows = readCSV('Participants.csv');
  console.log(`  Found ${rows.length} participants`);

  console.log('Reading Participant_Intel.csv...');
  const intelRows = readCSV('Participant_Intel.csv');
  console.log(`  Found ${intelRows.length} intel records`);

  // Build intel lookup by organization name
  const intelByOrg = new Map<string, Record<string, string>>();
  for (const row of intelRows) {
    const orgName = (row.Organization || '').trim();
    if (orgName) {
      intelByOrg.set(orgName.toLowerCase(), row);
    }
  }

  // Read existing lat/lng
  const existingLatLng = readExistingLatLng();
  console.log(`  Preserved ${existingLatLng.size} existing lat/lng coordinates`);

  const participants: string[] = [];

  for (const row of rows) {
    const orgName = (row.Organization || '').trim();
    if (!orgName) continue;

    // Generate a stable ID
    const rawParticipantId = (row.Participant_ID || '').trim();
    let id: string;
    if (rawParticipantId.startsWith('p_')) {
      id = rawParticipantId;
    } else if (rawParticipantId.includes('::')) {
      // It's a Canton Party ID - create a short ID from org name
      id = 'p_' + orgName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
    } else if (rawParticipantId) {
      id = 'p_' + orgName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
    } else {
      id = 'p_' + orgName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
    }

    // Build capabilities from boolean columns
    const caps: Record<string, number> = {};
    for (const col of CAPABILITY_COLUMNS) {
      if (toBool(row[col])) {
        caps[col] = 1;
      }
    }

    // Criticality
    const criticality = (row.Criticality || 'OPTIONAL').toUpperCase();
    const critVal = criticality === 'CRITICAL' ? 'CRITICAL' :
                    criticality === 'REQUIRED' ? 'REQUIRED' :
                    criticality === 'STANDARD' ? 'OPTIONAL' : 'OPTIONAL';

    // Canton Role
    const cantonRole = (row.Canton_Role || '').trim();

    // Holdings
    const holdings = (row.Holdings || '').trim() || undefined;

    // Validator info
    const validatorNodes = toNumber(row.Validator_Nodes || '0');
    const superValidator = (row.Super_Validator || '').toLowerCase() === 'yes' ||
                          (row.Super_Validator || '').startsWith('Yes');

    // Description - prefer intel description if richer
    const intelData = intelByOrg.get(orgName.toLowerCase());
    let description = (row.Description || '').trim();
    if (intelData && intelData.Description && intelData.Description.length > description.length) {
      description = intelData.Description.trim();
    }

    // Website
    const website = (row.Website || '').trim() || (intelData?.Website || '').trim() || undefined;

    // X Handle
    const xHandle = (row.X_Handle || '').trim() || (intelData?.X_Handle || '').trim() || undefined;

    // Location
    const location = (row.Location || '').trim() || (intelData?.Locations || '').trim() || undefined;

    // CIP
    const cip = (row.CIP || '').trim() || undefined;

    // SV Weight
    const svWeight = row.SV_Weight ? toNumber(row.SV_Weight) : undefined;

    // Is SV/FA/etc
    const isSV = toBool(row.Is_SV);
    const isFA = toBool(row.Is_FA);
    const isFoundationMember = toBool(row.Is_Foundation_Member);
    const isValidator = toBool(row.Is_Validator);
    const isNodeOperator = toBool(row.Is_Node_Operator);

    // Vote results
    const voteResult = (row.Vote_Result || '').trim() || undefined;

    // CC Distributed
    const ccDistributed = row.CC_Distributed ? toNumber(row.CC_Distributed) : undefined;

    // Canton Party ID (from Participant_ID if it contains ::)
    const cantonPartyId = rawParticipantId.includes('::') ? rawParticipantId : undefined;

    // Notes
    const notes = (row.Notes || '').trim() || undefined;

    // Source
    const source = (row.Source || '').trim() || undefined;

    // Partners from intel
    const partners = (intelData?.Partners || '').trim() || undefined;
    const tickers = (intelData?.Tickers || '').trim() || undefined;

    // Lat/Lng - preserve from existing data
    const existing = existingLatLng.get(id);
    const lat = existing?.lat;
    const lng = existing?.lng;

    // Build participant entry
    let entry = `  {\n`;
    entry += `    id: '${esc(id)}',\n`;
    entry += `    name: '${esc(orgName)}',\n`;
    entry += `    cantonRole: '${esc(cantonRole)}',\n`;
    
    // Capabilities
    const capEntries = Object.entries(caps);
    if (capEntries.length > 0) {
      entry += `    capabilities: { ${capEntries.map(([k, v]) => `${k}: ${v}`).join(', ')} },\n`;
    } else {
      entry += `    capabilities: {},\n`;
    }

    entry += `    criticality: '${critVal}',\n`;
    
    if (holdings) entry += `    holdings: '${esc(holdings)}',\n`;
    entry += `    validatorNodes: ${validatorNodes},\n`;
    entry += `    superValidator: ${superValidator},\n`;
    if (description) entry += `    description: '${esc(description)}',\n`;
    if (website) entry += `    website: '${esc(website)}',\n`;
    if (xHandle) entry += `    xHandle: '${esc(xHandle)}',\n`;
    if (location) entry += `    location: '${esc(location)}',\n`;
    if (cip) entry += `    cip: '${esc(cip)}',\n`;
    if (svWeight !== undefined && svWeight > 0) entry += `    svWeight: ${svWeight},\n`;
    if (isSV) entry += `    isSV: true,\n`;
    if (isFA) entry += `    isFA: true,\n`;
    if (isFoundationMember) entry += `    isFoundationMember: true,\n`;
    if (isValidator) entry += `    isValidator: true,\n`;
    if (isNodeOperator) entry += `    isNodeOperator: true,\n`;
    if (voteResult) entry += `    voteResult: '${esc(voteResult)}',\n`;
    if (ccDistributed && ccDistributed > 0) entry += `    ccDistributed: ${ccDistributed},\n`;
    if (cantonPartyId) entry += `    cantonPartyId: '${esc(cantonPartyId)}',\n`;
    if (notes) entry += `    notes: '${esc(notes)}',\n`;
    if (source) entry += `    source: '${esc(source)}',\n`;
    if (partners) entry += `    partners: '${esc(partners)}',\n`;
    if (tickers) entry += `    tickers: '${esc(tickers)}',\n`;
    if (lat !== undefined) entry += `    lat: ${lat},\n`;
    if (lng !== undefined) entry += `    lng: ${lng},\n`;

    entry += `  }`;
    participants.push(entry);
  }

  return participants;
}

// ── TRANSFORM: People.csv → intelPeople ──────────────────

function transformPeople() {
  console.log('Reading People.csv...');
  const rows = readCSV('People.csv');
  console.log(`  Found ${rows.length} people`);

  const people: string[] = [];

  for (const row of rows) {
    const fullName = (row.Full_Name || '').trim();
    if (!fullName) continue;

    const id = (row.Person_ID || '').trim().toLowerCase().replace(/-/g, '_').replace(/per_/g, 'per-');
    const currentRole = (row.Current_Role || '').trim();
    const organization = (row.Organization || '').trim();
    const cantonRoles = (row.Canton_Roles || '').split(',').map((r: string) => r.trim()).filter(Boolean);
    const eventsAttended = (row.Events_Attended || '').split(',').map((e: string) => e.trim()).filter(Boolean);
    const relationship = (row.Relationship_to_Flowryd || 'None').trim();
    const priority = (row.Priority || 'Low').trim();
    const lastContactDate = (row.Last_Contact_Date || '').trim() || undefined;
    const linkedinUrl = (row.LinkedIn_URL || '').trim() || undefined;
    const twitterHandle = (row.Twitter_Handle || '').trim() || undefined;
    const notes = (row.Notes || '').trim() || undefined;

    // Map organization to participant ID
    const orgId = 'p_' + organization.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);

    let entry = `  {\n`;
    entry += `    id: '${esc(id)}',\n`;
    entry += `    fullName: '${esc(fullName)}',\n`;
    entry += `    currentRole: '${esc(currentRole)}',\n`;
    entry += `    organizationId: '${esc(orgId)}',\n`;
    entry += `    organization: '${esc(organization)}',\n`;
    entry += `    cantonRoles: [${cantonRoles.map((r: string) => `'${esc(r)}'`).join(', ')}],\n`;
    entry += `    eventIds: [${eventsAttended.map((e: string) => `'${esc(e.toLowerCase().replace(/-/g, '_').replace(/evt_/g, 'evt-'))}'`).join(', ')}],\n`;
    entry += `    mediaIds: [],\n`;
    entry += `    relationshipToFlowryd: '${esc(relationship)}' as const,\n`;
    entry += `    priority: '${esc(priority)}' as const,\n`;
    if (lastContactDate) entry += `    lastContactDate: '${esc(lastContactDate)}',\n`;
    if (linkedinUrl) entry += `    linkedinUrl: '${esc(linkedinUrl)}',\n`;
    if (twitterHandle) entry += `    twitterHandle: '${esc(twitterHandle)}',\n`;
    if (notes) entry += `    notes: '${esc(notes)}',\n`;
    entry += `  }`;
    people.push(entry);
  }

  return people;
}

// ── TRANSFORM: Events.csv → intelEvents ──────────────────

function transformEvents() {
  console.log('Reading Events.csv...');
  const rows = readCSV('Events.csv');
  console.log(`  Found ${rows.length} events`);

  const events: string[] = [];

  for (const row of rows) {
    const name = (row.Event_Name || '').trim();
    if (!name) continue;

    const id = (row.Event_ID || '').trim().toLowerCase().replace(/-/g, '-');
    const type = (row.Event_Type || 'Conference').trim();
    const startDate = (row.Start_Date || '').trim();
    const endDate = (row.End_Date || '').trim();
    const location = (row.Location || '').trim();
    const venue = (row.Venue || '').trim() || undefined;
    const attendeeCap = row.Attendee_Cap ? toNumber(row.Attendee_Cap) : undefined;
    const applicationRequired = (row.Application_Required || '').toLowerCase() === 'yes';
    const cantonRelevance = (row.Canton_Relevance || 'Medium').trim();
    const cantonSpeakers = (row.Canton_Speakers || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    const cantonOrgs = (row.Canton_Orgs_Present || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    const topics = (row.Topics_Covered || '').split(',').map((t: string) => t.trim()).filter(Boolean);
    const flowrydAttended = (row.Flowryd_Attended || '').toLowerCase() === 'yes';
    const flowrydSpeaking = (row.Flowryd_Speaking || '').toLowerCase() === 'yes';
    const followUpActions = (row.Follow_Up_Actions || '').trim() || undefined;
    const notes = (row.Notes || '').trim() || undefined;

    let entry = `  {\n`;
    entry += `    id: '${esc(id.toLowerCase())}',\n`;
    entry += `    name: '${esc(name)}',\n`;
    entry += `    type: '${esc(type)}' as const,\n`;
    entry += `    startDate: '${esc(startDate)}T09:00:00Z',\n`;
    entry += `    endDate: '${esc(endDate)}T18:00:00Z',\n`;
    entry += `    location: '${esc(location)}',\n`;
    if (venue) entry += `    venue: '${esc(venue)}',\n`;
    if (attendeeCap) entry += `    attendeeCap: ${attendeeCap},\n`;
    entry += `    applicationRequired: ${applicationRequired},\n`;
    entry += `    cantonRelevance: '${esc(cantonRelevance)}' as const,\n`;
    entry += `    cantonSpeakerIds: [${cantonSpeakers.map((s: string) => `'${esc(s)}'`).join(', ')}],\n`;
    entry += `    cantonOrgIds: [${cantonOrgs.map((o: string) => `'p_${esc(o.toLowerCase().replace(/[^a-z0-9]/g, ''))}'`).join(', ')}],\n`;
    entry += `    topicsCovered: [${topics.map((t: string) => `'${esc(t)}'`).join(', ')}],\n`;
    entry += `    flowrydAttended: ${flowrydAttended},\n`;
    entry += `    flowrydSpeaking: ${flowrydSpeaking},\n`;
    if (followUpActions) entry += `    followUpActions: '${esc(followUpActions)}',\n`;
    if (notes) entry += `    notes: '${esc(notes)}',\n`;
    entry += `  }`;
    events.push(entry);
  }

  return events;
}

// ── TRANSFORM: Announcements.csv → intelAnnouncements ────

function transformAnnouncements() {
  console.log('Reading Announcements.csv...');
  const rows = readCSV('Announcements.csv');
  console.log(`  Found ${rows.length} announcements`);

  const announcements: string[] = [];

  for (const row of rows) {
    const description = (row.Description || '').trim();
    if (!description) continue;

    const id = (row.Announcement_ID || '').trim().toLowerCase();
    const date = (row.Date || '').trim();
    const participants = (row.Participants || '').split(',').map((p: string) => p.trim()).filter(Boolean);
    const type = (row.Type || '').trim();
    const sourceUrl = (row.Source_URL || '').trim() || undefined;
    const impact = (row.Impact || 'Medium').trim();
    const notes = (row.Notes || '').trim() || undefined;

    let entry = `  {\n`;
    entry += `    id: '${esc(id)}',\n`;
    entry += `    date: '${esc(date)}',\n`;
    entry += `    participants: [${participants.map((p: string) => `'${esc(p)}'`).join(', ')}],\n`;
    entry += `    type: '${esc(type)}',\n`;
    entry += `    description: '${esc(description)}',\n`;
    if (sourceUrl) entry += `    sourceUrl: '${esc(sourceUrl)}',\n`;
    entry += `    impact: '${esc(impact)}' as const,\n`;
    if (notes) entry += `    notes: '${esc(notes)}',\n`;
    entry += `  }`;
    announcements.push(entry);
  }

  return announcements;
}

// ── TRANSFORM: CIP_Registry.csv → cipRegistry ────────────

function transformCIPRegistry() {
  console.log('Reading CIP_Registry.csv...');
  const rows = readCSV('CIP_Registry.csv');
  console.log(`  Found ${rows.length} CIPs`);

  const cips: string[] = [];

  for (const row of rows) {
    const cipNumber = (row.CIP_Number || '').trim();
    if (!cipNumber) continue;

    const title = (row.Title || '').trim();
    const proposer = (row.Proposer || '').trim();
    const type = (row.Type || '').trim();
    const svWeightRequested = row.SV_Weight_Requested ? row.SV_Weight_Requested.trim() : undefined;
    const status = (row.Status || '').trim();
    const voteResult = (row.Vote_Result || '').trim() || undefined;
    const svNodeopsVote = (row.SV_Nodeops_Vote || '').trim() || undefined;
    const ccDistributed = row.CC_Distributed ? row.CC_Distributed.trim() : undefined;
    const description = (row.Description || '').trim() || undefined;
    const notes = (row.Notes || '').trim() || undefined;

    let entry = `  {\n`;
    entry += `    cipNumber: '${esc(cipNumber)}',\n`;
    entry += `    title: '${esc(title)}',\n`;
    entry += `    proposer: '${esc(proposer)}',\n`;
    entry += `    type: '${esc(type)}',\n`;
    if (svWeightRequested && svWeightRequested !== 'TBD') entry += `    svWeightRequested: ${toNumber(svWeightRequested)},\n`;
    entry += `    status: '${esc(status)}',\n`;
    if (voteResult) entry += `    voteResult: '${esc(voteResult)}',\n`;
    if (svNodeopsVote) entry += `    svNodeopsVote: '${esc(svNodeopsVote)}',\n`;
    if (ccDistributed && toNumber(ccDistributed) > 0) entry += `    ccDistributed: ${toNumber(ccDistributed)},\n`;
    if (description) entry += `    description: '${esc(description)}',\n`;
    if (notes) entry += `    notes: '${esc(notes)}',\n`;
    entry += `  }`;
    cips.push(entry);
  }

  return cips;
}

// ── TRANSFORM: Templates.csv → templates ─────────────────

function transformTemplates() {
  console.log('Reading Templates.csv...');
  const rows = readCSV('Templates.csv');
  console.log(`  Found ${rows.length} templates`);

  const templates: string[] = [];

  for (const row of rows) {
    const name = (row.Template_Name || '').trim();
    if (!name) continue;

    const id = (row.Template_ID || '').trim();
    const description = (row.Description || '').trim();
    const category = (row.Category || '').trim();
    const participantColumn = (row.Participant_Column || '').trim();
    const foundationCategoryMap = (row.Foundation_Category_Map || '').trim();

    let entry = `  {\n`;
    entry += `    id: '${esc(id)}',\n`;
    entry += `    name: '${esc(name)}',\n`;
    entry += `    description: '${esc(description)}',\n`;
    entry += `    category: '${esc(category)}',\n`;
    entry += `    participantColumn: '${esc(participantColumn)}',\n`;
    entry += `    foundationCategoryMap: '${esc(foundationCategoryMap)}',\n`;
    entry += `  }`;
    templates.push(entry);
  }

  return templates;
}

// ── TRANSFORM: Flows.csv → flows ─────────────────────────

function transformFlows() {
  console.log('Reading Flows.csv...');
  const rows = readCSV('Flows.csv');
  console.log(`  Found ${rows.length} flows`);

  const flows: string[] = [];

  for (const row of rows) {
    const name = (row.Flow_Name || '').trim();
    if (!name) continue;

    const id = (row.Flow_ID || '').trim();
    const category = (row.Category || '').trim();
    const description = (row.Description || '').trim();
    const stepCount = toNumber(row.Step_Count || '0');
    const source = (row.Source || '').trim();
    const status = (row.Status || '').trim();

    let entry = `  {\n`;
    entry += `    id: '${esc(id)}',\n`;
    entry += `    name: '${esc(name)}',\n`;
    entry += `    category: '${esc(category)}',\n`;
    entry += `    description: '${esc(description)}',\n`;
    entry += `    stepCount: ${stepCount},\n`;
    entry += `    source: '${esc(source)}',\n`;
    entry += `    status: '${esc(status)}' as const,\n`;
    entry += `  }`;
    flows.push(entry);
  }

  return flows;
}

// ── TRANSFORM: Flow_Steps.csv → flowSteps ────────────────

function transformFlowSteps() {
  console.log('Reading Flow_Steps.csv...');
  const rows = readCSV('Flow_Steps.csv');
  console.log(`  Found ${rows.length} flow steps`);

  const steps: string[] = [];

  for (const row of rows) {
    const flowId = (row.Flow_ID || '').trim();
    if (!flowId) continue;

    const step = toNumber(row.Step || '0');
    const templateName = (row.Template_Name || '').trim();
    const action = (row.Action || '').trim();
    const inputs = (row.Inputs || '').trim();
    const outputs = (row.Outputs || '').trim();
    const triggersNext = (row.Triggers_Next || '').trim();
    const cantonPrivacy = (row.Canton_Privacy || '').trim();
    const notes = (row.Notes || '').trim() || undefined;

    let entry = `  {\n`;
    entry += `    flowId: '${esc(flowId)}',\n`;
    entry += `    step: ${step},\n`;
    entry += `    templateName: '${esc(templateName)}',\n`;
    entry += `    action: '${esc(action)}',\n`;
    entry += `    inputs: '${esc(inputs)}',\n`;
    entry += `    outputs: '${esc(outputs)}',\n`;
    entry += `    triggersNext: '${esc(triggersNext)}',\n`;
    entry += `    cantonPrivacy: '${esc(cantonPrivacy)}',\n`;
    if (notes) entry += `    notes: '${esc(notes)}',\n`;
    entry += `  }`;
    steps.push(entry);
  }

  return steps;
}

// ── TRANSFORM: Template_Participants.csv → templateParticipants ──

function transformTemplateParticipants() {
  console.log('Reading Template_Participants.csv...');
  const rows = readCSV('Template_Participants.csv');
  console.log(`  Found ${rows.length} template-participant mappings`);

  const mappings: string[] = [];

  for (const row of rows) {
    const templateName = (row.Template_Name || '').trim();
    const orgName = (row.Organization || '').trim();
    if (!templateName || !orgName) continue;

    const participantId = (row.Participant_ID || '').trim();
    const isSV = toBool(row.Is_SV);
    const isValidator = toBool(row.Is_Validator);
    const cantonRole = (row.Canton_Role || '').trim();
    const foundationCategory = (row.Foundation_Category || '').trim();

    // Generate a stable participant reference
    let pId: string;
    if (participantId.startsWith('p_')) {
      pId = participantId;
    } else if (participantId.includes('::')) {
      pId = 'p_' + orgName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
    } else {
      pId = 'p_' + orgName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
    }

    let entry = `  { templateName: '${esc(templateName)}', participantId: '${esc(pId)}', organization: '${esc(orgName)}', isSV: ${isSV}, isValidator: ${isValidator}, cantonRole: '${esc(cantonRole)}'${foundationCategory ? `, foundationCategory: '${esc(foundationCategory)}'` : ''} }`;
    mappings.push(entry);
  }

  return mappings;
}

// ── GENERATE OUTPUT FILES ────────────────────────────────

function generateCantonData(participants: string[]): string {
  return `export interface Participant {
  id: string;
  name: string;
  cantonRole: string;
  capabilities: {
    [key: string]: number;
  };
  criticality: 'CRITICAL' | 'REQUIRED' | 'OPTIONAL';
  holdings?: string;
  validatorNodes?: number;
  superValidator?: boolean;
  hosted?: boolean;
  description?: string;
  logo?: string;
  isUser?: boolean;
  lat?: number;
  lng?: number;
  // Enriched fields from Liz's data
  website?: string;
  xHandle?: string;
  location?: string;
  cip?: string;
  svWeight?: number;
  isSV?: boolean;
  isFA?: boolean;
  isFoundationMember?: boolean;
  isValidator?: boolean;
  isNodeOperator?: boolean;
  voteResult?: string;
  ccDistributed?: number;
  cantonPartyId?: string;
  notes?: string;
  source?: string;
  partners?: string;
  tickers?: string;
}

export interface WorkflowStage {
  name: string;
  roles: string[];
}

export interface Workflow {
  id: string;
  name: string;
  stages: WorkflowStage[];
  description: string;
  roles: string[];
  featuredApps?: FeaturedApp[];
  orchestrationFee?: number;
  stackCategory?: 'defi' | 'custody' | 'compliance' | 'issuance' | 'custom';
}

export interface FeaturedApp {
  participantId: string;
  revenueSharePct: number;
}

export const participants: Participant[] = [
${participants.join(',\n')}
];

// Convenience lookups
export const participantById = new Map(participants.map(p => [p.id, p]));
export const participantByName = new Map(participants.map(p => [p.name.toLowerCase(), p]));
export const svParticipants = participants.filter(p => p.isSV);
export const faParticipants = participants.filter(p => p.isFA);
export const criticalParticipants = participants.filter(p => p.criticality === 'CRITICAL');
export const validatorParticipants = participants.filter(p => p.validatorNodes && p.validatorNodes > 0);
export const superValidatorParticipants = participants.filter(p => p.superValidator);
`;
}

function generateIntelData(
  people: string[],
  events: string[],
  announcements: string[],
  cips: string[]
): string {
  return `import { participants, type Participant } from './canton-data';

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
  organization: string;
  cantonRoles: string[];
  linkedinUrl?: string;
  twitterHandle?: string;
  eventIds: string[];
  mediaIds: string[];
  relationshipToFlowryd: 'None' | 'Warm' | 'Connected' | 'Partner' | 'Prospect' | 'Self' | 'N/A';
  introducedById?: string;
  lastContactDate?: string;
  notes?: string;
  priority: 'High' | 'Medium' | 'Low' | 'Critical' | 'N/A';
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

export interface IntelAnnouncement {
  id: string;
  date: string;
  participants: string[];
  type: string;
  description: string;
  sourceUrl?: string;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  notes?: string;
}

export interface CIPRecord {
  cipNumber: string;
  title: string;
  proposer: string;
  type: string;
  svWeightRequested?: number;
  status: string;
  voteResult?: string;
  svNodeopsVote?: string;
  ccDistributed?: number;
  description?: string;
  notes?: string;
}

// ── Data ────────────────────────────────────────────────

export const intelEvents: IntelEvent[] = [
${events.join(',\n')}
];

export const intelPeople: IntelPerson[] = [
${people.join(',\n')}
];

export const intelMedia: IntelMedia[] = [];

export const intelAnnouncements: IntelAnnouncement[] = [
${announcements.join(',\n')}
];

export const cipRegistry: CIPRecord[] = [
${cips.join(',\n')}
];

// ── Lookup Helpers ──────────────────────────────────────

export function getPersonById(id: string): IntelPerson | undefined {
  return intelPeople.find(p => p.id === id);
}

export function getOrgById(id: string): Participant | undefined {
  return participants.find(p => p.id === id);
}

export function getOrgByName(name: string): Participant | undefined {
  return participants.find(p => p.name.toLowerCase() === name.toLowerCase());
}

export function getPeopleForEvent(eventId: string): IntelPerson[] {
  return intelPeople.filter(p => p.eventIds.includes(eventId));
}

export function getEventsForPerson(personId: string): IntelEvent[] {
  const person = getPersonById(personId);
  if (!person) return [];
  return intelEvents.filter(e => person.eventIds.includes(e.id));
}

export function getMediaForPerson(personId: string): IntelMedia[] {
  const person = getPersonById(personId);
  if (!person) return [];
  return intelMedia.filter(m => person.mediaIds.includes(m.id));
}

export function getOrgsForEvent(eventId: string): Participant[] {
  const event = intelEvents.find(e => e.id === eventId);
  if (!event) return [];
  return event.cantonOrgIds.map(id => participants.find(p => p.id === id)).filter(Boolean) as Participant[];
}

export function getAnnouncementsForOrg(orgName: string): IntelAnnouncement[] {
  return intelAnnouncements.filter(a => 
    a.participants.some(p => p.toLowerCase().includes(orgName.toLowerCase()))
  );
}

export function getCIPsForOrg(orgName: string): CIPRecord[] {
  return cipRegistry.filter(c => 
    c.proposer.toLowerCase().includes(orgName.toLowerCase())
  );
}
`;
}

function generateTemplatesData(
  templates: string[],
  flows: string[],
  flowSteps: string[],
  templateParticipants: string[]
): string {
  return `// Canton Templates, Flows, and Flow Steps Data
// Generated from Liz's FLOWRYDDATA CSVs

export interface CantonTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  participantColumn: string;
  foundationCategoryMap: string;
}

export interface CantonFlow {
  id: string;
  name: string;
  category: string;
  description: string;
  stepCount: number;
  source: string;
  status: 'PROVEN' | 'DESIGN' | 'ACTIVE' | 'PLANNED';
}

export interface CantonFlowStep {
  flowId: string;
  step: number;
  templateName: string;
  action: string;
  inputs: string;
  outputs: string;
  triggersNext: string;
  cantonPrivacy: string;
  notes?: string;
}

export interface TemplateParticipantMapping {
  templateName: string;
  participantId: string;
  organization: string;
  isSV: boolean;
  isValidator: boolean;
  cantonRole: string;
  foundationCategory?: string;
}

export const cantonTemplates: CantonTemplate[] = [
${templates.join(',\n')}
];

export const cantonFlows: CantonFlow[] = [
${flows.join(',\n')}
];

export const cantonFlowSteps: CantonFlowStep[] = [
${flowSteps.join(',\n')}
];

export const templateParticipants: TemplateParticipantMapping[] = [
${templateParticipants.join(',\n')}
];

// ── Lookup Helpers ──────────────────────────────────────

export function getTemplateByName(name: string): CantonTemplate | undefined {
  return cantonTemplates.find(t => t.name === name);
}

export function getFlowById(id: string): CantonFlow | undefined {
  return cantonFlows.find(f => f.id === id);
}

export function getStepsForFlow(flowId: string): CantonFlowStep[] {
  return cantonFlowSteps.filter(s => s.flowId === flowId).sort((a, b) => a.step - b.step);
}

export function getParticipantsForTemplate(templateName: string): TemplateParticipantMapping[] {
  return templateParticipants.filter(tp => tp.templateName === templateName);
}

export function getTemplatesForParticipant(participantId: string): string[] {
  return [...new Set(
    templateParticipants
      .filter(tp => tp.participantId === participantId)
      .map(tp => tp.templateName)
  )];
}
`;
}

// ── MAIN ─────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Liz FLOWRYDDATA → TypeScript Conversion');
  console.log('═══════════════════════════════════════════════════\n');

  // Wave 1A: Participants
  const participantEntries = transformParticipants();

  // Wave 1B: People
  const peopleEntries = transformPeople();

  // Wave 1C: Events + Announcements
  const eventEntries = transformEvents();
  const announcementEntries = transformAnnouncements();

  // Wave 1D: CIP Registry
  const cipEntries = transformCIPRegistry();

  // Wave 1E: Templates, Flows, Flow Steps, Template Participants
  const templateEntries = transformTemplates();
  const flowEntries = transformFlows();
  const flowStepEntries = transformFlowSteps();
  const templateParticipantEntries = transformTemplateParticipants();

  console.log('\n--- Generating TypeScript files ---\n');

  // Generate canton-data.ts
  const cantonDataContent = generateCantonData(participantEntries);
  const cantonDataPath = join(SRC_DIR, 'canton-data.ts');
  writeFileSync(cantonDataPath, cantonDataContent, 'utf-8');
  console.log(`✅ Written: ${cantonDataPath} (${participantEntries.length} participants)`);

  // Generate canton-intel-data.ts
  const intelDataContent = generateIntelData(peopleEntries, eventEntries, announcementEntries, cipEntries);
  const intelDataPath = join(SRC_DIR, 'canton-intel-data.ts');
  writeFileSync(intelDataPath, intelDataContent, 'utf-8');
  console.log(`✅ Written: ${intelDataPath} (${peopleEntries.length} people, ${eventEntries.length} events, ${announcementEntries.length} announcements, ${cipEntries.length} CIPs)`);

  // Generate canton-templates-data.ts
  const templatesDataContent = generateTemplatesData(templateEntries, flowEntries, flowStepEntries, templateParticipantEntries);
  const templatesDataPath = join(SRC_DIR, 'canton-templates-data.ts');
  writeFileSync(templatesDataPath, templatesDataContent, 'utf-8');
  console.log(`✅ Written: ${templatesDataPath} (${templateEntries.length} templates, ${flowEntries.length} flows, ${flowStepEntries.length} steps, ${templateParticipantEntries.length} mappings)`);

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  DONE — All data files generated');
  console.log('═══════════════════════════════════════════════════');
}

main().catch(console.error);
