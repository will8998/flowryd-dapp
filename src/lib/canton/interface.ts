import type { CantonWalletBalance, DeployContractParams, SubmitTransactionParams, CantonTransactionReceipt, CantonContractStatus, FAMarkerData } from './types';

export interface CantonService {
  deployContract(params: DeployContractParams): Promise<CantonTransactionReceipt>;
  getWalletBalance(walletAddress: string): Promise<CantonWalletBalance>;
  submitTransaction(params: SubmitTransactionParams): Promise<CantonTransactionReceipt>;
  getFAMarkers(flowId: string): Promise<FAMarkerData[]>;
  getContractStatus(contractId: string): Promise<CantonContractStatus>;
}