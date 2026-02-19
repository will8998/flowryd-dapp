export interface ServiceProviderSeed {
  name: string;
  category: 'strategy' | 'development' | 'creative';
  description: string;
  website: string;
}

export const SERVICE_PROVIDERS: ServiceProviderSeed[] = [
  {
    name: 'Oliver Wyman',
    category: 'strategy',
    description: 'Global management consulting firm specializing in financial services strategy, digital transformation, and risk management.',
    website: 'https://oliverwyman.com',
  },
  {
    name: 'McKinsey Digital',
    category: 'strategy',
    description: 'Strategic advisory for institutional blockchain adoption, operating model design, and digital asset strategy.',
    website: 'https://mckinsey.com/capabilities/mckinsey-digital',
  },
  {
    name: 'IntellectEU',
    category: 'development',
    description: 'Canton Network integration specialists. NaaS, Daml development, and institutional-grade blockchain infrastructure.',
    website: 'https://intellecteu.com',
  },
  {
    name: 'Digital Asset',
    category: 'development',
    description: 'Creators of Daml and Canton Network. Smart contract development, protocol consulting, and validator operations.',
    website: 'https://digitalasset.com',
  },
  {
    name: 'Chainbridge Labs',
    category: 'development',
    description: 'Full-stack blockchain development team specializing in multi-party workflow automation and Daml smart contracts.',
    website: 'https://chainbridgelabs.com',
  },
  {
    name: 'Lippincott',
    category: 'creative',
    description: 'Brand strategy and design consultancy for institutional fintech, product naming, and market positioning.',
    website: 'https://lippincott.com',
  },
  {
    name: 'Work & Co',
    category: 'creative',
    description: 'Digital product design studio specializing in institutional UX, dashboard design, and complex workflow interfaces.',
    website: 'https://work.co',
  },
  {
    name: 'R3 Advisory',
    category: 'strategy',
    description: 'Distributed ledger technology advisory for capital markets, regulatory compliance, and DLT architecture design.',
    website: 'https://r3.com',
  },
  {
    name: 'Bain & Company',
    category: 'strategy',
    description: 'Management consulting for tokenized asset strategy, institutional partnership development, and go-to-market planning.',
    website: 'https://bain.com',
  },
  {
    name: 'IDEO',
    category: 'creative',
    description: 'Human-centered design firm specializing in complex systems design, service blueprinting, and innovation strategy.',
    website: 'https://ideo.com',
  },
];

export const PROVIDER_CATEGORIES = {
  strategy: { label: 'Strategy', color: 'blue', description: 'Strategic advisory and consulting' },
  development: { label: 'Development', color: 'emerald', description: 'Technical development and integration' },
  creative: { label: 'Creative', color: 'purple', description: 'Design, branding, and creative services' },
} as const;
