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
  isUser?: boolean;
  lat?: number;
  lng?: number;
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
  {
    id: "p_dtcc",
    name: "DTCC",
    cantonRole: "Registry + Issuer",
    capabilities: { Registry: 1, Settlement: 1 },
    criticality: "CRITICAL",
    holdings: "$45.2T",
    validatorNodes: 4,
    superValidator: false,
    description: "The premier post-trade market infrastructure for the global financial services industry.",
    lat: 40.7146,
    lng: -74.0071
  },
  {
    id: "p_euroclear",
    name: "Euroclear",
    cantonRole: "Registry + Collateral",
    capabilities: { Registry: 1, Collateral_Agent: 1, Settlement: 1 },
    criticality: "CRITICAL",
    holdings: "$37T",
    validatorNodes: 0,
    superValidator: false,
    description: "A global provider of Financial Market Infrastructure (FMI) services.",
    lat: 50.8503,
    lng: 4.3517
  },
  {
    id: "p_broadridge",
    name: "Broadridge",
    cantonRole: "Repo Financing",
    capabilities: { Repo_Platform: 1, Collateral_Agent: 1 },
    criticality: "CRITICAL",
    holdings: "$55B",
    validatorNodes: 2,
    superValidator: false,
    description: "Global Fintech leader with DLR (Distributed Ledger Repo) platform on Canton.",
    lat: 40.7580,
    lng: -73.9855
  },
  {
    id: "p_hkex",
    name: "HKEX Synapse",
    cantonRole: "Exchange",
    capabilities: { Exchange: 1, Settlement: 1 },
    criticality: "REQUIRED",
    holdings: "$4T",
    validatorNodes: 0,
    superValidator: false,
    description: "Leading global operator of exchanges and clearing houses.",
    lat: 22.2860,
    lng: 114.1580
  },
  {
    id: "p_nasdaq",
    name: "Nasdaq",
    cantonRole: "Exchange + Tech",
    capabilities: { Exchange: 1, Registry: 1 },
    criticality: "REQUIRED",
    holdings: "$20T",
    validatorNodes: 0,
    superValidator: false,
    description: "Global technology company serving the capital markets and other industries.",
    lat: 40.7566,
    lng: -73.9863
  },
  {
    id: "p_bny",
    name: "BNY",
    cantonRole: "Custody",
    capabilities: { Custody: 1, Collateral_Agent: 1 },
    criticality: "CRITICAL",
    holdings: "$44.3T",
    validatorNodes: 0,
    superValidator: false,
    description: "World's largest custodian bank.",
    lat: 40.7074,
    lng: -74.0113
  },
  {
    id: "p_bofa",
    name: "Bank of America",
    cantonRole: "Financing",
    capabilities: { Cash_Lender: 1, Collateral_Provider: 1 },
    criticality: "CRITICAL",
    holdings: "$3.2T",
    validatorNodes: 0,
    superValidator: false,
    description: "multinational investment bank and financial services holding company.",
    lat: 35.2271,
    lng: -80.8431
  },
  {
    id: "p_sg",
    name: "Société Générale",
    cantonRole: "Tokenized Assets",
    capabilities: { Issuer: 1, Collateral_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "$1.8T",
    validatorNodes: 2,
    superValidator: false,
    description: "Issued the first digital green bond on a public blockchain.",
    lat: 48.8773,
    lng: 2.3301
  },
  {
    id: "p_bnp",
    name: "BNP Paribas",
    cantonRole: "Tokenized Assets",
    capabilities: { Issuer: 1, Custody: 1 },
    criticality: "REQUIRED",
    holdings: "$2.7T",
    validatorNodes: 0,
    superValidator: false,
    description: "European Union's leading bank and key player in international banking.",
    lat: 48.8766,
    lng: 2.3522
  },
  {
    id: "p_db",
    name: "Deutsche Bank",
    cantonRole: "Financing",
    capabilities: { Cash_Lender: 1, Custody: 1 },
    criticality: "REQUIRED",
    holdings: "$1.4T",
    validatorNodes: 0,
    superValidator: false,
    description: "Leading German bank connected to Broadridge's DLR solution.",
    lat: 50.1109,
    lng: 8.6821
  },
  {
    id: "p_hsbc",
    name: "HSBC",
    cantonRole: "Tokenized Assets",
    capabilities: { Issuer: 1, Custody: 1 },
    criticality: "REQUIRED",
    holdings: "$3T",
    validatorNodes: 0,
    superValidator: false,
    description: "Provides HSBC Orion asset tokenization platform.",
    lat: 51.5142,
    lng: -0.0760
  },
  {
    id: "p_sc",
    name: "Standard Chartered",
    cantonRole: "Custody",
    capabilities: { Custody: 1, Cash_Lender: 1 },
    criticality: "REQUIRED",
    holdings: "$800B",
    validatorNodes: 0,
    superValidator: false,
    description: "Leading international banking group.",
    lat: 51.5139,
    lng: -0.0823
  },
  {
    id: "p_drw",
    name: "DRW",
    cantonRole: "Liquidity",
    capabilities: { Liquidity_Provider: 1, Market_Maker: 1 },
    criticality: "CRITICAL",
    holdings: "$12B",
    validatorNodes: 0,
    superValidator: false,
    description: "Diversified trading firm innovating across markets.",
    lat: 41.8824,
    lng: -87.6319
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
    description: "Specialized cryptoasset trading unit of DRW.",
    lat: 41.8830,
    lng: -87.6340
  },
  {
    id: "p_citadel",
    name: "Citadel Securities",
    cantonRole: "Liquidity",
    capabilities: { Liquidity_Provider: 1, Market_Maker: 1 },
    criticality: "CRITICAL",
    holdings: "$400B",
    validatorNodes: 1,
    superValidator: false,
    description: "Next-generation capital markets firm.",
    lat: 25.7617,
    lng: -80.1918
  },
  {
    id: "p_flowtraders",
    name: "Flow Traders",
    cantonRole: "Liquidity",
    capabilities: { Liquidity_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "$500M",
    validatorNodes: 1,
    superValidator: false,
    description: "Global digital liquidity provider.",
    lat: 52.3543,
    lng: 4.8856
  },
  {
    id: "p_galaxy",
    name: "Galaxy",
    cantonRole: "Liquidity",
    capabilities: { Liquidity_Provider: 1, Custody: 1 },
    criticality: "REQUIRED",
    holdings: "$3B",
    validatorNodes: 1,
    superValidator: false,
    description: "Digital asset and blockchain leader.",
    lat: 40.7540,
    lng: -73.9870
  },
  {
    id: "p_gsr",
    name: "GSR",
    cantonRole: "Liquidity",
    capabilities: { Liquidity_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "$1B",
    validatorNodes: 1,
    superValidator: false,
    description: "Global crypto market maker and ecosystem partner.",
    lat: 51.5074,
    lng: -0.1278
  },
  {
    id: "p_wintermute",
    name: "Wintermute",
    cantonRole: "Liquidity",
    capabilities: { Liquidity_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "$2B",
    validatorNodes: 1,
    superValidator: false,
    description: "Algorithmic liquidity provider for digital assets.",
    lat: 51.5156,
    lng: -0.1019
  },
  {
    id: "p_b2c2",
    name: "B2C2",
    cantonRole: "Liquidity",
    capabilities: { Liquidity_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "$800M",
    validatorNodes: 1,
    superValidator: false,
    description: "Institutional crypto liquidity provider.",
    lat: 51.5130,
    lng: -0.0920
  },
  {
    id: "p_falconx",
    name: "FalconX",
    cantonRole: "Prime Broker",
    capabilities: { Collateral_Taker: 1, Liquidity_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "$1.5B",
    validatorNodes: 1,
    superValidator: false,
    description: "Digital asset prime brokerage.",
    lat: 37.3861,
    lng: -122.0839
  },
  {
    id: "p_tradeweb",
    name: "Tradeweb",
    cantonRole: "Exchange",
    capabilities: { Exchange: 1 },
    criticality: "CRITICAL",
    holdings: "N/A",
    validatorNodes: 1,
    superValidator: false,
    description: "Leading builder and operator of electronic marketplaces.",
    lat: 40.7580,
    lng: -73.9710
  },
  {
    id: "p_copper",
    name: "Copper",
    cantonRole: "Custody",
    capabilities: { Custody: 1, Collateral_Agent: 1 },
    criticality: "CRITICAL",
    holdings: "$50B",
    validatorNodes: 1,
    superValidator: false,
    description: "Institutional digital asset custody and settlement.",
    lat: 51.5200,
    lng: -0.0700
  },
  {
    id: "p_zodia",
    name: "Zodia Custody",
    cantonRole: "Custody",
    capabilities: { Custody: 1 },
    criticality: "REQUIRED",
    holdings: "$2B",
    validatorNodes: 5,
    superValidator: false,
    description: "Institutional crypto custodian by Standard Chartered.",
    lat: 51.5139,
    lng: -0.0823
  },
  {
    id: "p_bitgo",
    name: "BitGo",
    cantonRole: "Custody",
    capabilities: { Custody: 1, Wallet: 1 },
    criticality: "CRITICAL",
    holdings: "$64B",
    validatorNodes: 1,
    superValidator: false,
    description: "Digital asset security and liquidity.",
    lat: 37.3940,
    lng: -122.1500
  },
  {
    id: "p_anchorage",
    name: "Anchorage Digital",
    cantonRole: "Custody",
    capabilities: { Custody: 1 },
    criticality: "REQUIRED",
    holdings: "$30B",
    validatorNodes: 1,
    superValidator: false,
    description: "First federally chartered digital asset bank.",
    lat: 37.4030,
    lng: -122.1100
  },
  {
    id: "p_fireblocks",
    name: "Fireblocks",
    cantonRole: "Custody Tech",
    capabilities: { Custody: 1, Wallet: 1 },
    criticality: "REQUIRED",
    holdings: "$100B+",
    validatorNodes: 0,
    superValidator: false,
    description: "Enterprise platform for building blockchain applications.",
    lat: 40.7128,
    lng: -74.0060
  },
  {
    id: "p_finoa",
    name: "Finoa",
    cantonRole: "Custody",
    capabilities: { Custody: 1, Staking: 1 },
    criticality: "OPTIONAL",
    holdings: "$1B",
    validatorNodes: 6,
    superValidator: false,
    description: "Regulated custodian for crypto assets.",
    lat: 52.5200,
    lng: 13.4050
  },
  {
    id: "p_hex_trust",
    name: "Hex Trust",
    cantonRole: "Custody",
    capabilities: { Custody: 1 },
    criticality: "OPTIONAL",
    holdings: "$5B",
    validatorNodes: 1,
    superValidator: false,
    description: "Institutional digital asset custodian.",
    lat: 22.2800,
    lng: 114.1600
  },
  {
    id: "p_blackrock",
    name: "BlackRock",
    cantonRole: "Asset Manager",
    capabilities: { Issuer: 1, Collateral_Provider: 1 },
    criticality: "CRITICAL",
    holdings: "$10T",
    validatorNodes: 0,
    superValidator: false,
    description: "World's largest asset manager.",
    lat: 40.7614,
    lng: -73.9776
  },
  {
    id: "p_franklin",
    name: "Franklin Templeton",
    cantonRole: "Asset Manager",
    capabilities: { Issuer: 1, Collateral_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "$1.5T",
    validatorNodes: 1,
    superValidator: false,
    description: "Global investment management organization.",
    lat: 37.7749,
    lng: -122.4194
  },
  {
    id: "p_21shares",
    name: "21.co / 21Shares",
    cantonRole: "Issuer",
    capabilities: { Issuer: 1 },
    criticality: "OPTIONAL",
    holdings: "$2B",
    validatorNodes: 1,
    superValidator: false,
    description: "Issuer of crypto ETPs.",
    lat: 47.3769,
    lng: 8.5417
  },
  {
    id: "p_coinshares",
    name: "CoinShares",
    cantonRole: "Issuer",
    capabilities: { Issuer: 1, Liquidity_Provider: 1 },
    criticality: "OPTIONAL",
    holdings: "$3B",
    validatorNodes: 1,
    superValidator: false,
    description: "European digital asset investment firm.",
    lat: 55.9533,
    lng: -3.1883
  },
  {
    id: "p_paxos",
    name: "Paxos",
    cantonRole: "Stablecoin Issuer",
    capabilities: { Issuer: 1, Settlement: 1 },
    criticality: "CRITICAL",
    holdings: "$20B",
    validatorNodes: 1,
    superValidator: false,
    description: "Regulated blockchain infrastructure platform.",
    lat: 40.7128,
    lng: -74.0060
  },
  {
    id: "p_circle",
    name: "Circle",
    cantonRole: "Stablecoin Issuer",
    capabilities: { Issuer: 1, Settlement: 1 },
    criticality: "CRITICAL",
    holdings: "$28B",
    validatorNodes: 3,
    superValidator: false,
    description: "Issuer of USDC and EURC.",
    lat: 42.3601,
    lng: -71.0589
  },
  {
    id: "p_chainlink",
    name: "Chainlink",
    cantonRole: "Oracle",
    capabilities: { Valuation_Pricing: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 1,
    superValidator: false,
    description: "Decentralized oracle network.",
    lat: 37.5585,
    lng: -122.2711
  },
  {
    id: "p_pyth",
    name: "Pyth Network",
    cantonRole: "Oracle",
    capabilities: { Valuation_Pricing: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 1,
    superValidator: false,
    description: "First-party financial oracle network.",
    lat: 37.7749,
    lng: -122.4194
  },
  {
    id: "p_coinmetrics",
    name: "Coin Metrics",
    cantonRole: "Data",
    capabilities: { Valuation_Pricing: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 1,
    superValidator: false,
    description: "Crypto financial intelligence.",
    lat: 42.3601,
    lng: -71.0589
  },
  {
    id: "p_kaiko",
    name: "Kaiko",
    cantonRole: "Data",
    capabilities: { Valuation_Pricing: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 1,
    superValidator: false,
    description: "Institutional digital asset data.",
    lat: 48.8566,
    lng: 2.3522
  },
  {
    id: "p_da",
    name: "Digital Asset",
    cantonRole: "Orchestration",
    capabilities: { Orchestration: 1, Registry: 1 },
    criticality: "CRITICAL",
    holdings: "N/A",
    validatorNodes: 32,
    superValidator: true,
    description: "Creators of the Canton Network and Daml.",
    lat: 40.7484,
    lng: -73.9857
  },
  {
    id: "p_blockdaemon",
    name: "Blockdaemon",
    cantonRole: "Infrastructure",
    capabilities: { Staking: 1, Infrastructure: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 3,
    superValidator: false,
    description: "Institutional blockchain infrastructure.",
    lat: 40.7228,
    lng: -73.9987
  },
  {
    id: "p_figment",
    name: "Figment",
    cantonRole: "Infrastructure",
    capabilities: { Staking: 1 },
    criticality: "OPTIONAL",
    holdings: "N/A",
    validatorNodes: 2,
    superValidator: false,
    description: "Web3 infrastructure provider.",
    lat: 43.6532,
    lng: -79.3832
  },
  {
    id: "p_equilend",
    name: "EquiLend",
    cantonRole: "Securities Finance",
    capabilities: { Repo_Platform: 1, Collateral_Agent: 1 },
    criticality: "REQUIRED",
    holdings: "$2.4T",
    validatorNodes: 0,
    superValidator: false,
    description: "Securities lending platform 1Source on Canton.",
    lat: 40.7580,
    lng: -73.9700
  },
  {
    id: "p_versana",
    name: "Versana",
    cantonRole: "Syndicated Loans",
    capabilities: { Registry: 1, Settlement: 1 },
    criticality: "REQUIRED",
    holdings: "$900B",
    validatorNodes: 0,
    superValidator: false,
    description: "Industry-backed syndicated loan platform.",
    lat: 40.7590,
    lng: -73.9710
  },
  {
    id: "p_trm",
    name: "TRM Labs",
    cantonRole: "Compliance",
    capabilities: { Legal_Compliance: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 1,
    superValidator: false,
    description: "Blockchain intelligence and compliance.",
    lat: 37.7880,
    lng: -122.4000
  },
  {
    id: "p_elliptic",
    name: "Elliptic",
    cantonRole: "Compliance",
    capabilities: { Legal_Compliance: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 1,
    superValidator: false,
    description: "Crypto compliance solutions.",
    lat: 51.5134,
    lng: -0.0890
  },
  {
    id: "p_cygnet",
    name: "Cygnet",
    cantonRole: "Custody",
    capabilities: { Custody: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 1,
    superValidator: false,
    description: "Institutional custody and settlement.",
    lat: 51.5155,
    lng: -0.0922
  },
  {
    id: "p_bronfoundation",
    name: "Bron Foundation",
    cantonRole: "Wallets",
    capabilities: { Wallet: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Institutional-grade non-custodial wallet for businesses and individuals to store and manage Canton Coin",
    lat: 47.3769,
    lng: 8.5417
  },
  {
    id: "p_blackmantacapitalpar",
    name: "Black Manta Capital Partners",
    cantonRole: "Tokenized Assets",
    capabilities: { Issuer: 1 },
    criticality: "CRITICAL",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Multi-STO asset management platform for compliant asset tokenization with integrated investor onboarding",
    lat: 49.6116,
    lng: 6.1319
  },
  {
    id: "p_ubs",
    name: "UBS",
    cantonRole: "Banking",
    capabilities: { Cash_Lender: 1, Collateral_Provider: 1 },
    criticality: "CRITICAL",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Global investment bank and wealth manager",
    lat: 47.3769,
    lng: 8.5417
  },
  {
    id: "p_asterizmprotocol",
    name: "Asterizm Protocol",
    cantonRole: "Infrastructure",
    capabilities: { Settlement: 1, Registry: 1 },
    criticality: "CRITICAL",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Collateral Bridge enabling secure transfer of digital assets and tokenized RWAs between Canton Network",
    lat: 25.2048,
    lng: 55.2708
  },
  {
    id: "p_ondofinance",
    name: "Ondo Finance",
    cantonRole: "Tokenized Assets",
    capabilities: { Issuer: 1 },
    criticality: "CRITICAL",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Institutional-grade tokenized securities",
    lat: 40.7484,
    lng: -73.9857
  },
  {
    id: "p_akascan",
    name: "AKASCAN",
    cantonRole: "Compliance",
    capabilities: { Compliance_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Free vulnerability scanning for the Canton ecosystem for asset protection and compliance",
    lat: 48.8566,
    lng: 2.3522
  },
  {
    id: "p_hydrax",
    name: "HydraX",
    cantonRole: "Infrastructure",
    capabilities: { Settlement: 1, Registry: 1 },
    criticality: "CRITICAL",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Regulated market infrastructure building digital capital markets for digitalized assets, including d",
    lat: 1.2833,
    lng: 103.8333
  },
  {
    id: "p_safe",
    name: "Safe",
    cantonRole: "Wallets",
    capabilities: { Wallet: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Multi-sig wallet and asset management",
    lat: 52.5200,
    lng: 13.4050
  },
  {
    id: "p_archax",
    name: "Archax",
    cantonRole: "Tokenized Assets",
    capabilities: { Issuer: 1 },
    criticality: "CRITICAL",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Digital securities exchange and tokenization",
    lat: 51.5074,
    lng: -0.1278
  },
  {
    id: "p_bnymellon",
    name: "BNY Mellon",
    cantonRole: "Custody",
    capabilities: { Custody: 1 },
    criticality: "CRITICAL",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Custody and asset servicing",
    lat: 40.7084,
    lng: -74.0123
  },
  {
    id: "p_fairmint",
    name: "Fairmint",
    cantonRole: "Tokenized Assets",
    capabilities: { Issuer: 1 },
    criticality: "CRITICAL",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "SEC-registered Transfer Agent bringing equity onchain - turning customer cap tables into smart contr",
    lat: 37.7749,
    lng: -122.4194
  },
  {
    id: "p_tether",
    name: "Tether",
    cantonRole: "Stablecoins",
    capabilities: { Payment_Stablecoin: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Issuer of USDT stablecoin",
    lat: 41.9029,
    lng: 12.4534
  },
  {
    id: "p_bitalpha",
    name: "Bitalpha",
    cantonRole: "Compliance",
    capabilities: { Compliance_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Transaction monitoring with ERP reconciliation, accounting automation, tax compliance, and data norm",
    lat: 52.5200,
    lng: 13.4050
  },
  {
    id: "p_noves",
    name: "Noves",
    cantonRole: "Onchain Data",
    capabilities: { Data_Oracle: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Complete, accurate, and reconcilable on-chain data from Canton nodes via UI and API for validators a",
    lat: 40.7128,
    lng: -74.0060
  },
  {
    id: "p_realt",
    name: "RealT",
    cantonRole: "Tokenized Assets",
    capabilities: { Issuer: 1 },
    criticality: "CRITICAL",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Real estate tokenization platform",
    lat: 25.7617,
    lng: -80.1918
  },
  {
    id: "p_coinbase",
    name: "Coinbase",
    cantonRole: "Exchanges",
    capabilities: { Exchange: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Cryptocurrency exchange and platform",
    lat: 37.7749,
    lng: -122.4194
  },
  {
    id: "p_excellar",
    name: "Excellar",
    cantonRole: "Tokenized Assets",
    capabilities: { Issuer: 1 },
    criticality: "CRITICAL",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Bermuda-regulated yield-bearing tokens denominated in dollars, bitcoin, and other cryptocurrencies",
    lat: 32.2949,
    lng: -64.7820
  },
  {
    id: "p_kraken",
    name: "Kraken",
    cantonRole: "Exchanges",
    capabilities: { Exchange: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Cryptocurrency exchange",
    lat: 37.7749,
    lng: -122.4194
  },
  {
    id: "p_binance",
    name: "Binance",
    cantonRole: "Exchanges",
    capabilities: { Exchange: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Cryptocurrency exchange",
    lat: 1.3521,
    lng: 103.8198
  },
  {
    id: "p_1pilot",
    name: "1Pilot",
    cantonRole: "Wallets",
    capabilities: { Wallet: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Dashboard showing wallet activity across multiple party IDs with summarized views. Education center",
    lat: 47.3769,
    lng: 8.5417
  },
  {
    id: "p_cantonswap",
    name: "CantonSwap",
    cantonRole: "Liquidity",
    capabilities: { Market_Maker: 1, Liquidity_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Decentralized exchange on Canton Network",
    lat: 47.3769,
    lng: 8.5417
  },
  {
    id: "p_sendwallet",
    name: "Send Wallet",
    cantonRole: "Wallets",
    capabilities: { Wallet: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Digital asset wallet",
    lat: 37.7749,
    lng: -122.4194
  },
  {
    id: "p_denex",
    name: "Denex",
    cantonRole: "Infrastructure",
    capabilities: { Settlement: 1, Registry: 1 },
    criticality: "CRITICAL",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Infrastructure-grade tools including Gas Station for bandwidth management and Subscription Module SD",
    lat: 1.2890,
    lng: 103.8450
  },
  {
    id: "p_c7identity",
    name: "C7 Identity",
    cantonRole: "Identity",
    capabilities: { Identity_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Digital identity and verification",
    lat: 47.3769,
    lng: 8.5417
  },
  {
    id: "p_bitsafe",
    name: "BitSafe",
    cantonRole: "Collateral, Compliance, Tokenized Assets",
    capabilities: { Compliance_Provider: 1, Issuer: 1 },
    criticality: "CRITICAL",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Providers of bridgeless wrapped Bitcoin solution on Canton (CBTC) with institutional-grade security",
    lat: 47.3769,
    lng: 8.5417
  },
  {
    id: "p_chainalysis",
    name: "Chainalysis",
    cantonRole: "Onchain Data",
    capabilities: { Data_Oracle: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Blockchain data and analytics platform",
    lat: 40.7128,
    lng: -74.0060
  },
  {
    id: "p_quadrata",
    name: "Quadrata",
    cantonRole: "Identity",
    capabilities: { Identity_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "On-chain identity and compliance",
    lat: 40.7580,
    lng: -73.9850
  },
  {
    id: "p_7trust",
    name: "7Trust",
    cantonRole: "Identity",
    capabilities: { Identity_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Cryptographically secure credential system linking Daml PartyIDs to DNS/domain ownership for Canton",
    lat: 47.3769,
    lng: 8.5417
  },
  {
    id: "p_alumlabs",
    name: "ALUM Labs",
    cantonRole: "Onchain Data",
    capabilities: { Data_Oracle: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Real-time visibility into validator uptime, performance, and balance growth with automated alerts an",
    lat: 1.3000,
    lng: 103.8500
  },
  {
    id: "p_cypherock",
    name: "Cypherock",
    cantonRole: "Wallets",
    capabilities: { Wallet: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Secure storage of Canton coins and assets through hardware and software wallet solutions",
    lat: 28.6139,
    lng: 77.2090
  },
  {
    id: "p_securitize",
    name: "Securitize",
    cantonRole: "Tokenized Assets",
    capabilities: { Issuer: 1 },
    criticality: "CRITICAL",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Digital securities issuance platform",
    lat: 25.7800,
    lng: -80.1900
  },
  {
    id: "p_bitwave",
    name: "BitWave",
    cantonRole: "Stablecoins, Compliance, Financing",
    capabilities: { Compliance_Provider: 1, Payment_Stablecoin: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "A digital asset finance platform for enterprises with audit-ready platform to track and price Canton",
    lat: 37.3860,
    lng: -122.0838
  },
  {
    id: "p_gemini",
    name: "Gemini",
    cantonRole: "Liquidity",
    capabilities: { Market_Maker: 1, Liquidity_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Gemini is a U.S.‑regulated cryptocurrency exchange and custodian connected on Canton",
    lat: 40.7580,
    lng: -73.9855
  },
  {
    id: "p_brale",
    name: "Brale",
    cantonRole: "Stablecoins, Wallets, Payments",
    capabilities: { Wallet: 1, Payment_Stablecoin: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "A platform for creating and launching stablecoins enabling Brale supported stabelcoins for use as an",
    lat: 37.7749,
    lng: -122.4194
  },
  {
    id: "p_metamask",
    name: "MetaMask",
    cantonRole: "Wallets",
    capabilities: { Wallet: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Crypto wallet and Web3 gateway",
    lat: 37.7749,
    lng: -122.4194
  },
  {
    id: "p_commerzbank",
    name: "Commerzbank",
    cantonRole: "Banking",
    capabilities: { Cash_Lender: 1, Collateral_Provider: 1 },
    criticality: "CRITICAL",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "German banking and financial services",
    lat: 50.1109,
    lng: 8.6821
  },
  {
    id: "p_dfns",
    name: "Dfns",
    cantonRole: "Wallets",
    capabilities: { Wallet: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Dfns is a digital asset wallet and custody infrastructure provider supporting Canton Coin and any as",
    lat: 48.8566,
    lng: 2.3522
  },
  {
    id: "p_chatatechnologies",
    name: "Chata Technologies",
    cantonRole: "Onchain Data",
    capabilities: { Data_Oracle: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "AI-driven proactive analytics with real-time alerts and natural language querying for Canton Network",
    lat: 51.0447,
    lng: -114.0719
  },
  {
    id: "p_lukka",
    name: "Lukka",
    cantonRole: "Compliance",
    capabilities: { Compliance_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "KYC and AML services for Canton Network and all utilized blockchains",
    lat: 40.7128,
    lng: -74.0060
  },
  {
    id: "p_veriff",
    name: "Veriff",
    cantonRole: "Identity",
    capabilities: { Identity_Provider: 1 },
    criticality: "REQUIRED",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Identity verification platform",
    lat: 59.4370,
    lng: 24.7536
  },
  // Manually added HQLAx and others if missing from TSV but present in previous context to ensure completeness
  {
    id: "p_hqla",
    name: "HQLAx",
    cantonRole: "Collateral",
    capabilities: { Collateral_Management: 1, Registry: 1 },
    criticality: "CRITICAL",
    holdings: "N/A",
    validatorNodes: 2,
    superValidator: false,
    description: "Innovative market solution for collateral mobility.",
    lat: 49.6116,
    lng: 6.1319
  },
  {
    id: "p_allenovery",
    name: "Allen & Overy",
    cantonRole: "Legal",
    capabilities: { Legal_Compliance: 1 },
    criticality: "OPTIONAL",
    holdings: "N/A",
    validatorNodes: 0,
    superValidator: false,
    description: "Global law firm specializing in financial services.",
    lat: 51.5155,
    lng: -0.1050
  }
];

export const workflows: Workflow[] = [
  {
    id: 'WF-001',
    name: 'Token Issuance',
    description: "Issue digital bonds or funds with automated lifecycle events.",
    roles: [
      'Issuer', 'Registry', 'Settlement', 'Custody', 'Wallet', 'Exchange',
      'Liquidity_Provider', 'Market_Maker', 'Collateral_Agent', 'Data_Oracle',
      'Payment_Stablecoin', 'Identity_Provider'
    ],
    stages: [
      {
        name: "Issuance",
        roles: ['Issuer', 'Registry', 'Identity_Provider']
      },
      {
        name: "Distribution/Trading",
        roles: ['Exchange', 'Liquidity_Provider', 'Market_Maker', 'Wallet']
      },
      {
        name: "Settlement/Custody",
        roles: ['Settlement', 'Custody', 'Payment_Stablecoin', 'Data_Oracle', 'Collateral_Agent']
      }
    ]
  },
  {
    id: 'WF-021',
    name: 'Collateral Management',
    description: "Automate collateral selection, allocation, and mobility across custodians.",
    roles: [
      'Collateral_Provider', 'Collateral_Taker', 'Collateral_Agent', 'Custody',
      'Registry', 'Settlement', 'Liquidity_Provider', 'Cash_Lender', 'Data_Oracle'
    ],
    stages: [
      {
        name: "Collateral Setup",
        roles: ['Collateral_Provider', 'Collateral_Agent', 'Custody']
      },
      {
        name: "Trading/Exposure",
        roles: ['Collateral_Taker', 'Liquidity_Provider', 'Cash_Lender']
      },
      {
        name: "Settlement",
        roles: ['Registry', 'Settlement', 'Data_Oracle']
      }
    ]
  },
  {
    id: 'WF-022',
    name: 'Repo Financing',
    description: "Intraday repo swaps with atomic settlement and programmable margins.",
    roles: [
      'Cash_Lender', 'Cash_Borrower', 'Repo_Platform', 'Custody', 'Registry',
      'Settlement', 'Collateral_Agent', 'Collateral_Provider', 'Data_Oracle',
      'Payment_Stablecoin'
    ],
    stages: [
      {
        name: "Collateral",
        roles: ['Collateral_Provider', 'Custody', 'Collateral_Agent']
      },
      {
        name: "Financing",
        roles: ['Cash_Lender', 'Cash_Borrower', 'Repo_Platform']
      },
      {
        name: "Settlement/Closeout",
        roles: ['Registry', 'Settlement', 'Data_Oracle', 'Payment_Stablecoin']
      }
    ]
  }
];
