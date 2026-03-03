import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { cantonTemplates, cantonFlows, cantonFlowSteps, templateParticipants } from '../src/db/schema';
import { 
  cantonTemplates as templatesData, 
  cantonFlows as flowsData, 
  cantonFlowSteps as stepsData, 
  templateParticipants as mappingsData 
} from '../src/lib/canton-templates-data';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = postgres(connectionString);
const db = drizzle(sql);

// Icon name mappings based on template names
const iconMappings: Record<string, string> = {
  'Custody Role': 'Shield',
  'Settlement Rail': 'Landmark', 
  'Registry Role': 'Database',
  'Tokenize / Issuer Role': 'Layers',
  'Exchange Role': 'BarChart3',
  'Compliance Check': 'ShieldCheck',
  'Wallet Provider': 'Wallet',
  'Liquidity Provider': 'Zap',
  'Collateral Agent': 'Shield',
  'Oracle / Pricing': 'Globe',
  'Identity Provider': 'ShieldCheck',
  'Explorer': 'Globe',
  'Bridge Role': 'Network'
};

// Color mappings based on template names
const colorMappings: Record<string, string> = {
  'Custody Role': 'orange',
  'Settlement Rail': 'blue',
  'Registry Role': 'blue', 
  'Tokenize / Issuer Role': 'purple',
  'Exchange Role': 'purple',
  'Compliance Check': 'amber',
  'Wallet Provider': 'cyan',
  'Liquidity Provider': 'green',
  'Collateral Agent': 'orange',
  'Oracle / Pricing': 'cyan',
  'Identity Provider': 'amber',
  'Explorer': 'cyan',
  'Bridge Role': 'indigo'
};

async function seedCantonArchitecture() {
  console.log('🌱 Seeding Canton architecture data...');

  try {
    // 1. Seed Canton Templates
    console.log('📋 Seeding Canton templates...');
    const templateInserts = templatesData.map((template, index) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      participantColumn: template.participantColumn,
      iconName: iconMappings[template.name] || 'Circle',
      color: colorMappings[template.name] || 'gray',
      sortOrder: index
    }));

    await db.insert(cantonTemplates)
      .values(templateInserts)
      .onConflictDoNothing();
    
    console.log(`✅ Inserted ${templateInserts.length} Canton templates`);

    // 2. Seed Canton Flows
    console.log('🔄 Seeding Canton flows...');
    const flowInserts = flowsData.map((flow, index) => ({
      id: flow.id,
      name: flow.name,
      category: flow.category,
      description: flow.description,
      source: flow.source,
      status: flow.status.toLowerCase() as 'proven' | 'design' | 'active' | 'planned', // Convert to lowercase
      stepCount: flow.stepCount,
      sortOrder: index
    }));

    await db.insert(cantonFlows)
      .values(flowInserts)
      .onConflictDoNothing();
    
    console.log(`✅ Inserted ${flowInserts.length} Canton flows`);

    // 3. Build template lookup map for flow steps
    console.log('🔗 Building template lookup map...');
    const templateLookup = new Map<string, string>();
    templatesData.forEach(template => {
      templateLookup.set(template.name, template.id);
    });

    // 4. Seed Canton Flow Steps
    console.log('📝 Seeding Canton flow steps...');
    const stepInserts = stepsData.map(step => {
      const templateId = templateLookup.get(step.templateName);
      if (!templateId) {
        console.warn(`⚠️  Template not found for step: ${step.templateName}`);
        return null;
      }
      
      return {
        flowId: step.flowId,
        step: step.step,
        templateId,
        templateName: step.templateName,
        action: step.action,
        inputs: step.inputs,
        outputs: step.outputs,
        triggersNext: step.triggersNext,
        cantonPrivacy: step.cantonPrivacy,
        notes: step.notes || null
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    if (stepInserts.length > 0) {
      await db.insert(cantonFlowSteps)
        .values(stepInserts)
        .onConflictDoNothing();
      
      console.log(`✅ Inserted ${stepInserts.length} Canton flow steps`);
    }

    // 5. Seed Template Participants
    console.log('👥 Seeding template participants...');
    const participantInserts = mappingsData.map(mapping => {
      const templateId = templateLookup.get(mapping.templateName);
      if (!templateId) {
        console.warn(`⚠️  Template not found for participant mapping: ${mapping.templateName}`);
        return null;
      }

      return {
        templateId,
        templateName: mapping.templateName,
        participantLegacyId: mapping.participantId,
        organization: mapping.organization,
        criticality: 'optional' as const, // Default criticality
        isSV: mapping.isSV,
        isValidator: mapping.isValidator,
        cantonRole: mapping.cantonRole,
        foundationCategory: mapping.foundationCategory || null
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    if (participantInserts.length > 0) {
      await db.insert(templateParticipants)
        .values(participantInserts)
        .onConflictDoNothing();
      
      console.log(`✅ Inserted ${participantInserts.length} template participant mappings`);
    }

    console.log('🎉 Canton architecture seeding completed successfully!');
    
    // Print summary
    console.log('\n📊 Summary:');
    console.log(`   Templates: ${templateInserts.length}`);
    console.log(`   Flows: ${flowInserts.length}`);
    console.log(`   Flow Steps: ${stepInserts.length}`);
    console.log(`   Template Participants: ${participantInserts.length}`);

  } catch (error) {
    console.error('❌ Error seeding Canton architecture:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run the seeding
if (require.main === module) {
  seedCantonArchitecture()
    .then(() => {
      console.log('✨ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export default seedCantonArchitecture;