export type CantonTransactionHash = `0x${string}`;
export type CantonContractId = `canton::contract-${string}`;
export type CantonPartyId = string;

export interface CantonWalletBalance {
  walletAddress: string;
  balanceCC: string; // $CC amount as string (like "1500.00")
  balanceUSD: string; // Estimated USD equivalent
  lastUpdated: string; // ISO timestamp
}

export interface DeployContractParams {
  templateId: string;
  participants: CantonPartyId[];
  flowId?: string;
  metadata?: Record<string, unknown>;
}

export interface SubmitTransactionParams {
  contractId: CantonContractId;
  choice: string;
  argument: Record<string, unknown>;
  actAs: CantonPartyId;
}

export interface CantonTransactionReceipt {
  transactionHash: CantonTransactionHash;
  contractId: CantonContractId;
  status: 'pending' | 'committed' | 'failed';
  timestamp: string;
  participants: CantonPartyId[];
  metadata?: Record<string, unknown>;
}

export interface CantonContractStatus {
  contractId: CantonContractId;
  templateId: string;
  status: 'active' | 'archived' | 'pending';
  createdAt: string;
  participants: CantonPartyId[];
  lastActivityAt: string;
}

export interface FAMarkerData {
  flowId: string;
  appName: string;
  markerCount: number;
  rewardCC: string; // $CC earned
  multiplier: number; // Up to 100x
  generatedAt: string;
}