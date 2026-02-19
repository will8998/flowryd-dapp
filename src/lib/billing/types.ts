export type PlanTier = 'discover' | 'navigate' | 'activate';
export type SubscriptionStatus = 'pending' | 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
export type InvoiceStatus = 'draft' | 'paid' | 'void';

export interface InvoiceLineItem {
  description: string;
  amount: number; // in cents
  currency: string;
  period?: { start: string; end: string };
}

export interface PlanConfig {
  tier: PlanTier;
  name: string;
  priceAmount: number; // in cents
  priceCurrency: string;
  interval: 'monthly' | 'annual';
  features: string[];
  unlockedTiers: string[]; // Which FlowsStudio tiers this plan unlocks
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  discover: {
    tier: 'discover',
    name: 'Discover',
    priceAmount: 10000, // $100.00
    priceCurrency: '$CC',
    interval: 'monthly',
    features: [
      'Network grid builder',
      'VP badges (C7 Identity)',
      'Connection intelligence',
      'Workflow opportunity identification',
    ],
    unlockedTiers: ['DISCOVER'],
  },
  navigate: {
    tier: 'navigate',
    name: 'Navigate',
    priceAmount: 25000, // $250.00
    priceCurrency: '$CC',
    interval: 'monthly',
    features: [
      'Everything in Discover',
      'Flows Studio access',
      'Join existing flows',
      'Build from templates',
      'Create custom workflows',
    ],
    unlockedTiers: ['DISCOVER', 'NAVIGATE'],
  },
  activate: {
    tier: 'activate',
    name: 'Activate',
    priceAmount: 50000, // $500.00 + 10% marketplace fee
    priceCurrency: '$CC',
    interval: 'monthly',
    features: [
      'Everything in Navigate',
      'Deploy workflows on-chain',
      'Deal rooms with real-time chat',
      'Execute coordinated transactions',
      'Earn Featured App markers',
    ],
    unlockedTiers: ['DISCOVER', 'NAVIGATE', 'ACTIVATE'],
  },
};

// Check if a plan tier allows access to a specific FlowsStudio tier
export function tierAllowsAccess(planTier: PlanTier, studioTier: string): boolean {
  return PLAN_CONFIGS[planTier].unlockedTiers.includes(studioTier);
}