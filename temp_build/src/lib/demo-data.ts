export interface FlowRole {
  id: string;
  name: string;
  requirements: string;
  status: 'KNOWN' | 'FILLED' | 'GAP';
  filledBy?: string;
  rewardShare?: number;
}

export interface PrivateFlow {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'RECRUITING' | 'READY' | 'ACTIVE';
  roles: FlowRole[];
  createdAt: string;
}

export const mockPrivateFlows: PrivateFlow[] = [
  {
    id: 'flow-dat-tokenization',
    name: 'Flow_DAT_Tokenization',
    description: 'Tokenize equity on Canton with crypto basket redemption feature.',
    status: 'DRAFT',
    createdAt: '2026-01-29',
    roles: [
      { id: 'r1', name: 'Issuer', requirements: 'Treasury Client', status: 'KNOWN', filledBy: 'Treasury Co.', rewardShare: 15 },
      { id: 'r2', name: 'Broker-Dealer', requirements: 'Texture Capital', status: 'FILLED', filledBy: 'Texture', rewardShare: 25 },
      { id: 'r3', name: 'Transfer Agent', requirements: 'Texture Capital', status: 'FILLED', filledBy: 'Texture', rewardShare: 10 },
      { id: 'r4', name: 'ATS Operator', requirements: 'Texture Capital', status: 'FILLED', filledBy: 'Texture', rewardShare: 10 },
      { id: 'r5', name: 'Crypto Custodian', requirements: 'Multi-coin custody (80+ PoS tokens)', status: 'GAP', rewardShare: 15 },
      { id: 'r6', name: 'Price Oracle', requirements: 'Real-time PoS pricing', status: 'GAP', rewardShare: 5 },
      { id: 'r7', name: 'Compliance Provider', requirements: 'KYC/AML for Canton', status: 'GAP', rewardShare: 10 },
    ]
  },
  {
    id: 'flow-mmf-trading',
    name: 'Flow_MMF_Trading',
    description: 'Money Market Fund trading and settlement on-chain.',
    status: 'DRAFT',
    createdAt: '2026-01-26',
    roles: [
      { id: 'm1', name: 'Fund Manager', requirements: 'Asset Manager', status: 'KNOWN', filledBy: 'Franklin', rewardShare: 20 },
      { id: 'm2', name: 'Custodian', requirements: 'Global Custodian', status: 'FILLED', filledBy: 'BNY', rewardShare: 15 },
      { id: 'm3', name: 'Transfer Agent', requirements: 'Digital TA', status: 'GAP', rewardShare: 10 },
      { id: 'm4', name: 'Distributor', requirements: 'Institutional Dealer', status: 'GAP', rewardShare: 25 },
      { id: 'm5', name: 'Compliance', requirements: 'Global KYC', status: 'GAP', rewardShare: 10 },
    ]
  }
];
