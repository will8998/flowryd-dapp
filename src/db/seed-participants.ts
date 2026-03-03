import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { participants } from './schema';
import { participants as cantonParticipants } from '../lib/canton-data';


function parseCriticality(c: string): 'critical' | 'required' | 'optional' {
  const lower = c.toLowerCase();
  if (lower === 'critical') return 'critical';
  if (lower === 'required') return 'required';
  return 'optional';
}

function parseRoles(cantonRole: string): string[] {
  return cantonRole
    .split(',')
    .map(r => r.trim())
    .filter(Boolean);
}

async function seedParticipants() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  console.log(`Seeding ${cantonParticipants.length} participants...`);

  const values = cantonParticipants.map(p => ({
    legacyId: p.id,
    name: p.name,
    description: p.description ?? null,
    website: p.website ?? null,
    cantonPartyId: p.cantonPartyId ?? null,
    roles: parseRoles(p.cantonRole),
    capabilities: p.capabilities,
    criticality: parseCriticality(p.criticality),
    holdings: p.holdings ?? null,
    validatorNodes: p.validatorNodes ?? 0,
    superValidator: p.superValidator ?? false,
    verificationStatus: 'unclaimed' as const,
    metadata: {
      xHandle: p.xHandle ?? null,
      location: p.location ?? null,
      cip: p.cip ?? null,
      svWeight: p.svWeight ?? null,
      isSV: p.isSV ?? false,
      isFA: p.isFA ?? false,
      isFoundationMember: p.isFoundationMember ?? false,
      isValidator: p.isValidator ?? false,
      isNodeOperator: p.isNodeOperator ?? false,
      voteResult: p.voteResult ?? null,
      ccDistributed: p.ccDistributed ?? null,
      notes: p.notes ?? null,
      source: p.source ?? null,
      partners: p.partners ?? null,
      tickers: p.tickers ?? null,
      lat: p.lat ?? null,
      lng: p.lng ?? null,
    },
  }));

  try {
    await db
      .insert(participants)
      .values(values)
      .onConflictDoNothing({ target: participants.legacyId });
    console.log(`Done. Seeded ${values.length} participants.`);
  } catch (err) {
    console.error('Seed failed:', err);
  }

  await client.end();
  process.exit(0);
}

seedParticipants();
