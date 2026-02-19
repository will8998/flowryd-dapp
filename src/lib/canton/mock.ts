import type { CantonService } from './interface';
import type { 
  CantonWalletBalance, 
  DeployContractParams, 
  SubmitTransactionParams, 
  CantonTransactionReceipt, 
  CantonContractStatus, 
  FAMarkerData,
  CantonTransactionHash,
  CantonContractId
} from './types';

export class MockCantonService implements CantonService {
  private generateTransactionHash(): CantonTransactionHash {
    const hex = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return `0x${hex}`;
  }

  private generateContractId(): CantonContractId {
    return `canton::contract-${crypto.randomUUID()}`;
  }

  async deployContract(params: DeployContractParams): Promise<CantonTransactionReceipt> {
    return {
      transactionHash: this.generateTransactionHash(),
      contractId: this.generateContractId(),
      status: 'committed',
      timestamp: new Date().toISOString(),
      participants: params.participants,
      metadata: params.metadata
    };
  }

  async getWalletBalance(walletAddress: string): Promise<CantonWalletBalance> {
    return {
      walletAddress,
      balanceCC: '15000.00',
      balanceUSD: '450.00',
      lastUpdated: new Date().toISOString()
    };
  }

  async submitTransaction(params: SubmitTransactionParams): Promise<CantonTransactionReceipt> {
    return {
      transactionHash: this.generateTransactionHash(),
      contractId: params.contractId,
      status: 'committed',
      timestamp: new Date().toISOString(),
      participants: [params.actAs],
      metadata: {
        choice: params.choice,
        argument: params.argument
      }
    };
  }

  async getFAMarkers(flowId: string): Promise<FAMarkerData[]> {
    const appNames = ['C7 Identity', 'Kaiko', 'Canton Wallet', 'Flowryd', 'DeFi Bridge'];
    const markerCount = Math.floor(Math.random() * 3) + 3;
    
    return Array.from({length: markerCount}, (_, i) => ({
      flowId,
      appName: appNames[i % appNames.length],
      markerCount: Math.floor(Math.random() * 50) + 10,
      rewardCC: (Math.random() * 500 + 50).toFixed(2),
      multiplier: Math.floor(Math.random() * 100) + 1,
      generatedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
    }));
  }

  async getContractStatus(contractId: string): Promise<CantonContractStatus> {
    const createdAt = new Date(Date.now() - Math.random() * 86400000 * 7);
    const lastActivityAt = new Date(createdAt.getTime() + Math.random() * 86400000 * 3);
    
    return {
      contractId: contractId as CantonContractId,
      templateId: `template-${crypto.randomUUID()}`,
      status: 'active',
      createdAt: createdAt.toISOString(),
      participants: [`party-${crypto.randomUUID()}`, `party-${crypto.randomUUID()}`],
      lastActivityAt: lastActivityAt.toISOString()
    };
  }
}