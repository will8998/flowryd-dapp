import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { organizations, users, flows, flowVersions, deals, dealParticipants } from '../src/db/schema';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log('Seeding database...');

  const [org] = await db
    .insert(organizations)
    .values({ name: 'Texture Finance', slug: 'texture-finance' })
    .onConflictDoNothing()
    .returning();

  const orgId = org?.id;
  if (!orgId) {
    console.log('Organization already exists, skipping seed.');
    return;
  }

  const [admin] = await db
    .insert(users)
    .values({
      partyId: 'texture::admin',
      orgId,
      displayName: 'Admin User',
      email: 'admin@texture.finance',
      role: 'admin',
    })
    .returning();

  const [editor] = await db
    .insert(users)
    .values({
      partyId: 'texture::editor',
      orgId,
      displayName: 'Editor User',
      email: 'editor@texture.finance',
      role: 'editor',
    })
    .returning();

  const [viewer] = await db
    .insert(users)
    .values({
      partyId: 'texture::viewer',
      orgId,
      displayName: 'Viewer User',
      role: 'viewer',
    })
    .returning();

  const [flow] = await db
    .insert(flows)
    .values({
      orgId,
      title: 'Cross-Border Settlement',
      description: 'Multi-party settlement workflow for cross-border transactions',
      status: 'published',
      isPublic: true,
      workflowType: 'settlement',
      createdBy: admin.id,
      updatedBy: admin.id,
    })
    .returning();

  await db.insert(flowVersions).values({
    flowId: flow.id,
    version: 1,
    nodes: [
      { id: 'n1', type: 'default', position: { x: 100, y: 100 }, data: { label: 'Initiator' } },
      { id: 'n2', type: 'default', position: { x: 400, y: 100 }, data: { label: 'Counterparty' } },
      { id: 'n3', type: 'default', position: { x: 250, y: 300 }, data: { label: 'Settlement Agent' } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n3' },
      { id: 'e2', source: 'n2', target: 'n3' },
    ],
    createdBy: admin.id,
  });

  const [deal] = await db
    .insert(deals)
    .values({
      orgId,
      flowId: flow.id,
      title: 'Q1 2026 Settlement — Texture x Goldman',
      description: 'Cross-border settlement for Q1 2026 bond issuance',
      status: 'open',
      volume: '$250M',
      createdBy: admin.id,
    })
    .returning();

  await db.insert(dealParticipants).values([
    { dealId: deal.id, userId: admin.id, role: 'admin' },
    { dealId: deal.id, userId: editor.id, role: 'editor' },
  ]);

  console.log('Seed complete!');
  console.log(`  Organization: ${orgId}`);
  console.log(`  Admin: texture::admin`);
  console.log(`  Editor: texture::editor`);
  console.log(`  Viewer: texture::viewer`);
  console.log(`  Flow: ${flow.id}`);
  console.log(`  Deal: ${deal.id}`);
}

seed().catch(console.error).finally(() => sql.end());
