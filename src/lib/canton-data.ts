export interface Participant {
  id: string;
  name: string;
  cantonRole: string;
  capabilities: {
    [key: string]: number;
  };
  criticality: 'CRITICAL' | 'REQUIRED' | 'OPTIONAL';
  holdings?: string; // Simulated
  validatorNodes?: number; // Real/Simulated count
  superValidator?: boolean; // From Super Validators CSV
  hosted?: boolean;
  description?: string;
  logo?: string; // Placeholder for now
}

export const participants: Participant[] = [
  // --- Market Infrastructure & Registries ---
  {
    id: "p_dtcc",
    name: "DTCC",
    cantonRole: "Registry + Issuer",
    capabilities: { Registry: 1, Settlement: 1 },
    criticality: "CRITICAL",
    holdings: "$45.2T",
    validatorNodes: 4,
    description: "The premier post-trade market infrastructure for the global financial services industry."
  },
  {
    id: "p_euroclear",
    name: "Euroclear",
    cantonRole: "Registry + Collateral",
    capabilities: { Registry: 1, Collateral_Agent: 1, Settlement: 1 },
    criticality: "CRITICAL",
    holdings: "$37T",
    validatorNodes: 0, // Participant
    description: "A global provider of Financial Market Infrastructure (FMI) services."
  },
  {
    id: "p_clearstream",
    name: "Clearstream",
    cantonRole: "Registry",
    capabilities: { Registry: 1, Settlement: 1 },
    criticality: "CRITICAL",
    holdings: "$16T",
    validatorNodes: 0,
    description: "International central securities depository (ICSD) based in Luxembourg."
  },
  {
    id: "p_broadridge",
    name: "Broadridge",
    cantonRole: "Collateral",
    capabilities: { Repo_Platform: 1, Collateral_Agent: 1 },
    criticality: "CRITICAL",
    holdings: "$55B",
    validatorNodes: 2,
    superValidator: false,
    description: "Global Fintech leader with DLR (Distributed Ledger Repo) platform on Canton."
  },
  {
    id: "p_hkex",
    name: "HKEX Synapse",
    cantonRole: "Exchange",
    capabilities: { Exchange: 1, Settlement: 1 },
    criticality: "REQUIRED",
    holdings: "$4T",
    validatorNodes: 0,
    description: "Leading global operator of exchanges and clearing houses."
  },
  {
    id: "p_nasdaq",
    name: "Nasdaq",
    cantonRole: "Exchange + Tech",
    capabilities: { Exchange: 1, Registry: 1 },
    criticality: "REQUIRED",
    holdings: "$20T",
    validatorNodes: 0,
    description: "Global technology company serving the capital markets and other industries."
  },

  // --- Global Banks (Financing & Collateral) ---
  {
    id: "p_gs",
    name: "Goldman Sachs",
    cantonRole: "Tokenized Assets",
    capabilities: { Collateral_Provider: 1, Issuer: 1, Cash_Lender: 1 },
    criticality: "CRITICAL",
    holdings: "$2.5T",
    validatorNodes: 0, // GS DAP runs on Canton
    description: "Operator of GS DAP®, a tokenization platform for digital assets."
  },
  {
    id: "p_jpm",
    name: "J.P. Morgan",
    cantonRole: "Financing",
    capabilities: { Collateral_Provider: 1, Cash_Lender: 1, Cash_Borrower: 1 },
    criticality: "CRITICAL",
    holdings: "$3.7T",
    validatorNodes: 0,
    description: "Leading global financial services firm and founding member of Versana."
  },
  {
    id: "p_bny",
    name: "BNY",
    cantonRole: "Custody",
    capabilities: { Custody: 1, Collateral_Agent: 1 },
    criticality: "CRITICAL",
    holdings: "$44.3T",
    validatorNodes: 0,
    description: "World's largest custodian bank."
  },
  {
    id: "p_bofa",
    name: "Bank of America",
    cantonRole: "Financing",
    capabilities: { Cash_Lender: 1, Collateral_Provider: 1 },
    criticality: "CRITICAL",
    holdings: "$3.2T",
    validatorNodes: 0,
    description: " multinational investment bank and financial services holding company."
  },
  {
    id: "p_sg",
    name: "Société Générale",
    cantonRole: "Tokenized Assets",
    capabilities: { Issuer: 1, Collateral_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "$1.8T",
    validatorNodes: 2,
    description: "Issued the first digital green bond on a public blockchain."
  },
  {
    id: "p_bnp",
    name: "BNP Paribas",
    cantonRole: "Tokenized Assets",
    capabilities: { Issuer: 1, Custody: 1 },
    criticality: "REQUIRED",
    holdings: "$2.7T",
    validatorNodes: 0,
    description: "European Union's leading bank and key player in international banking."
  },
  {
    id: "p_db",
    name: "Deutsche Bank",
    cantonRole: "Financing",
    capabilities: { Cash_Lender: 1, Custody: 1 },
    criticality: "REQUIRED",
    holdings: "$1.4T",
    validatorNodes: 0,
    description: "Leading German bank connected to Broadridge's DLR solution."
  },
  {
    id: "p_citi",
    name: "Citi",
    cantonRole: "Financing",
    capabilities: { Cash_Lender: 1, Settlement: 1 },
    criticality: "REQUIRED",
    holdings: "$2.4T",
    validatorNodes: 0,
    description: "Active participant in HKEX Synapse and Versana."
  },
  {
    id: "p_hsbc",
    name: "HSBC",
    cantonRole: "Tokenized Assets",
    capabilities: { Issuer: 1, Custody: 1 },
    criticality: "REQUIRED",
    holdings: "$3T",
    validatorNodes: 0,
    description: "Provides HSBC Orion asset tokenization platform."
  },
  {
    id: "p_sc",
    name: "Standard Chartered",
    cantonRole: "Custody",
    capabilities: { Custody: 1, Cash_Lender: 1 },
    criticality: "REQUIRED",
    holdings: "$800B",
    validatorNodes: 0,
    description: "Leading international banking group."
  },

  // --- Trading, Liquidity & Prime ---
  {
    id: "p_drw",
    name: "DRW",
    cantonRole: "Liquidity",
    capabilities: { Liquidity_Provider: 1, Market_Maker: 1 },
    criticality: "CRITICAL",
    holdings: "$12B",
    validatorNodes: 0,
    description: "Diversified trading firm innovating across markets."
  },
  {
    id: "p_cumberland",
    name: "Cumberland",
    cantonRole: "Liquidity",
    capabilities: { Liquidity_Provider: 1, Market_Maker: 1 },
    criticality: "CRITICAL",
    holdings: "$10B",
    validatorNodes: 8,
    superValidator: true,
    description: "Specialized cryptoasset trading unit of DRW."
  },
  {
    id: "p_citadel",
    name: "Citadel Securities",
    cantonRole: "Liquidity",
    capabilities: { Liquidity_Provider: 1, Market_Maker: 1 },
    criticality: "CRITICAL",
    holdings: "$400B",
    validatorNodes: 1,
    description: "Next-generation capital markets firm."
  },
  {
    id: "p_flowtraders",
    name: "Flow Traders",
    cantonRole: "Liquidity",
    capabilities: { Liquidity_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "$500M",
    validatorNodes: 1,
    description: "Global digital liquidity provider."
  },
  {
    id: "p_galaxy",
    name: "Galaxy",
    cantonRole: "Liquidity",
    capabilities: { Liquidity_Provider: 1, Custody: 1 },
    criticality: "REQUIRED",
    holdings: "$3B",
    validatorNodes: 1,
    description: "Digital asset and blockchain leader."
  },
  {
    id: "p_gsr",
    name: "GSR",
    cantonRole: "Liquidity",
    capabilities: { Liquidity_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "$1B",
    validatorNodes: 1,
    description: "Global crypto market maker and ecosystem partner."
  },
  {
    id: "p_wintermute",
    name: "Wintermute",
    cantonRole: "Liquidity",
    capabilities: { Liquidity_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "$2B",
    validatorNodes: 1,
    description: "Algorithmic liquidity provider for digital assets."
  },
  {
    id: "p_b2c2",
    name: "B2C2",
    cantonRole: "Liquidity",
    capabilities: { Liquidity_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "$800M",
    validatorNodes: 1,
    description: "Institutional crypto liquidity provider."
  },
  {
    id: "p_falconx",
    name: "FalconX",
    cantonRole: "Prime Broker",
    capabilities: { Collateral_Taker: 1, Liquidity_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "$1.5B",
    validatorNodes: 1,
    description: "Digital asset prime brokerage."
  },
  {
    id: "p_tradeweb",
    name: "Tradeweb",
    cantonRole: "Exchange",
    capabilities: { Exchange: 1 },
    criticality: "CRITICAL",
    holdings: "N/A",
    validatorNodes: 1,
    description: "Leading builder and operator of electronic marketplaces."
  },

  // --- Custody & Wallets ---
  {
    id: "p_copper",
    name: "Copper",
    cantonRole: "Custody",
    capabilities: { Custody: 1, Collateral_Agent: 1 },
    criticality: "CRITICAL",
    holdings: "$50B",
    validatorNodes: 1, // Has client refs
    description: "Institutional digital asset custody and settlement."
  },
  {
    id: "p_zodia",
    name: "Zodia Custody",
    cantonRole: "Custody",
    capabilities: { Custody: 1 },
    criticality: "REQUIRED",
    holdings: "$2B",
    validatorNodes: 5, // Multiple client validators
    description: "Institutional crypto custodian by Standard Chartered."
  },
  {
    id: "p_bitgo",
    name: "BitGo",
    cantonRole: "Custody",
    capabilities: { Custody: 1, Wallet: 1 },
    criticality: "CRITICAL",
    holdings: "$64B",
    validatorNodes: 1,
    description: "Digital asset security and liquidity."
  },
  {
    id: "p_anchorage",
    name: "Anchorage Digital",
    cantonRole: "Custody",
    capabilities: { Custody: 1 },
    criticality: "REQUIRED",
    holdings: "$30B",
    validatorNodes: 1,
    description: "First federally chartered digital asset bank."
  },
  {
    id: "p_fireblocks",
    name: "Fireblocks",
    cantonRole: "Custody Tech",
    capabilities: { Custody: 1, Wallet: 1 },
    criticality: "REQUIRED",
    holdings: "$100B+",
    validatorNodes: 0,
    description: "Enterprise platform for building blockchain applications."
  },
  {
    id: "p_finoa",
    name: "Finoa",
    cantonRole: "Custody",
    capabilities: { Custody: 1, Staking: 1 },
    criticality: "OPTIONAL",
    holdings: "$1B",
    validatorNodes: 6,
    description: "Regulated custodian for crypto assets."
  },
  {
    id: "p_hex_trust",
    name: "Hex Trust",
    cantonRole: "Custody",
    capabilities: { Custody: 1 },
    criticality: "OPTIONAL",
    holdings: "$5B",
    validatorNodes: 1,
    description: "Institutional digital asset custodian."
  },

  // --- Asset Managers & Issuers ---
  {
    id: "p_blackrock",
    name: "BlackRock",
    cantonRole: "Asset Manager",
    capabilities: { Issuer: 1, Collateral_Provider: 1 },
    criticality: "CRITICAL",
    holdings: "$10T",
    validatorNodes: 0,
    description: "World's largest asset manager."
  },
  {
    id: "p_franklin",
    name: "Franklin Templeton",
    cantonRole: "Asset Manager",
    capabilities: { Issuer: 1, Collateral_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "$1.5T",
    validatorNodes: 1,
    description: "Global investment management organization."
  },
  {
    id: "p_21shares",
    name: "21.co / 21Shares",
    cantonRole: "Issuer",
    capabilities: { Issuer: 1 },
    criticality: "OPTIONAL",
    holdings: "$2B",
    validatorNodes: 1,
    description: "Issuer of crypto ETPs."
  },
  {
    id: "p_coinshares",
    name: "CoinShares",
    cantonRole: "Issuer",
    capabilities: { Issuer: 1, Liquidity_Provider: 1 },
    criticality: "OPTIONAL",
    holdings: "$3B",
    validatorNodes: 1,
    description: "European digital asset investment firm."
  },
  {
    id: "p_paxos",
    name: "Paxos",
    cantonRole: "Stablecoin Issuer",
    capabilities: { Issuer: 1, Settlement: 1 },
    criticality: "CRITICAL",
    holdings: "$20B",
    validatorNodes: 1,
    description: "Regulated blockchain infrastructure platform."
  },
  {
    id: "p_circle",
    name: "Circle",
    cantonRole: "Stablecoin Issuer",
    capabilities: { Issuer: 1, Settlement: 1 },
    criticality: "CRITICAL",
    holdings: "$28B",
    validatorNodes: 3,
    description: "Issuer of USDC and EURC."
  },

  // --- Data & Oracles ---
  {
    id: "p_chainlink",
    name: "Chainlink",
    cantonRole: "Oracle",
    capabilities: { Valuation_Pricing: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 1,
    description: "Decentralized oracle network."
  },
  {
    id: "p_pyth",
    name: "Pyth Network",
    cantonRole: "Oracle",
    capabilities: { Valuation_Pricing: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 1,
    description: "First-party financial oracle network."
  },
  {
    id: "p_coinmetrics",
    name: "Coin Metrics",
    cantonRole: "Data",
    capabilities: { Valuation_Pricing: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 1,
    description: "Crypto financial intelligence."
  },
  {
    id: "p_kaiko",
    name: "Kaiko",
    cantonRole: "Data",
    capabilities: { Valuation_Pricing: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 1,
    description: "Institutional digital asset data."
  },

  // --- Tech & Infrastructure ---
  {
    id: "p_da",
    name: "Digital Asset",
    cantonRole: "Orchestration",
    capabilities: { Orchestration: 1, Registry: 1 },
    criticality: "CRITICAL",
    holdings: "N/A",
    validatorNodes: 32,
    superValidator: true,
    description: "Creators of the Canton Network and Daml."
  },
  {
    id: "p_microsoft",
    name: "Microsoft",
    cantonRole: "Cloud",
    capabilities: { Infrastructure: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    description: "Strategic partner for Canton Network."
  },
  {
    id: "p_deloitte",
    name: "Deloitte",
    cantonRole: "Audit/Compliance",
    capabilities: { Legal_Compliance: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    description: "Professional services network."
  },
  {
    id: "p_blockdaemon",
    name: "Blockdaemon",
    cantonRole: "Infrastructure",
    capabilities: { Staking: 1, Infrastructure: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 3,
    description: "Institutional blockchain infrastructure."
  },
  {
    id: "p_figment",
    name: "Figment",
    cantonRole: "Infrastructure",
    capabilities: { Staking: 1 },
    criticality: "OPTIONAL",
    holdings: "N/A",
    validatorNodes: 2,
    description: "Web3 infrastructure provider."
  },
  {
    id: "p_equilend",
    name: "EquiLend",
    cantonRole: "Securities Finance",
    capabilities: { Repo_Platform: 1, Collateral_Agent: 1 },
    criticality: "REQUIRED",
    holdings: "$2.4T",
    validatorNodes: 0,
    description: "Securities lending platform 1Source on Canton."
  },
  {
    id: "p_versana",
    name: "Versana",
    cantonRole: "Syndicated Loans",
    capabilities: { Registry: 1, Settlement: 1 },
    criticality: "REQUIRED",
    holdings: "$900B",
    validatorNodes: 0,
    description: "Industry-backed syndicated loan platform."
  },
  {
    id: "p_trm",
    name: "TRM Labs",
    cantonRole: "Compliance",
    capabilities: { Legal_Compliance: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 1,
    description: "Blockchain intelligence and compliance."
  },
  {
    id: "p_elliptic",
    name: "Elliptic",
    cantonRole: "Compliance",
    capabilities: { Legal_Compliance: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 1,
    description: "Crypto compliance solutions."
  }
];

export const workflows = [
  {
    id: 'WF-021',
    name: 'Collateral Management',
    category: 'Post-Trade / Post-Settlement Services',
    roles: ['Collateral_Provider', 'Collateral_Taker', 'Collateral_Agent', 'Custody', 
            'Valuation_Pricing', 'Settlement', 'Registry', 'Legal_Compliance'],
    description: "Automate collateral selection, allocation, and mobility across custodians."
  },
  {
    id: 'WF-022',
    name: 'Repo Processing',
    category: 'Post-Trade / Post-Settlement Services',
    roles: ['Cash_Lender', 'Cash_Borrower', 'Repo_Platform', 'Custody', 
            'Valuation_Pricing', 'Settlement', 'Registry', 'Legal_Compliance'],
    description: "Intraday repo swaps with atomic settlement and programmable margins."
  },
  {
    id: 'WF-035',
    name: 'Tokenized Asset Issuance',
    category: 'Primary Markets',
    roles: ['Issuer', 'Registry', 'Custody', 'Settlement', 'Legal_Compliance', 'Distribution'],
    description: "Issue digital bonds or funds with automated lifecycle events."
  }
];
