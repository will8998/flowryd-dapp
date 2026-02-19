export interface ChargeResult {
  chargeId: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
  currency: string;
  transactionHash?: string;
  timestamp: string;
}

export interface RefundResult {
  refundId: string;
  chargeId: string;
  status: 'success' | 'failed';
  amount: number;
  timestamp: string;
}

export interface BalanceResult {
  walletAddress: string;
  balance: string;
  currency: string;
}

export interface PaymentProvider {
  createCharge(params: { amount: number; currency: string; walletAddress: string; description: string }): Promise<ChargeResult>;
  refund(chargeId: string): Promise<RefundResult>;
  getBalance(walletAddress: string): Promise<BalanceResult>;
}

export class MockPaymentProvider implements PaymentProvider {
  async createCharge(params: { amount: number; currency: string; walletAddress: string; description: string }): Promise<ChargeResult> {
    return {
      chargeId: `mock_charge_${crypto.randomUUID()}`,
      status: 'success',
      amount: params.amount,
      currency: params.currency,
      transactionHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      timestamp: new Date().toISOString(),
    };
  }

  async refund(chargeId: string): Promise<RefundResult> {
    return {
      refundId: `mock_refund_${crypto.randomUUID()}`,
      chargeId,
      status: 'success',
      amount: 0,
      timestamp: new Date().toISOString(),
    };
  }

  async getBalance(walletAddress: string): Promise<BalanceResult> {
    return {
      walletAddress,
      balance: '15000.00',
      currency: '$CC',
    };
  }
}

export class CantonCCPaymentProvider implements PaymentProvider {
  async createCharge(): Promise<ChargeResult> {
    throw new Error('Canton $CC payment integration not yet implemented. Configure CANTON_WALLET_API_URL to enable.');
  }

  async refund(): Promise<RefundResult> {
    throw new Error('Canton $CC refund integration not yet implemented.');
  }

  async getBalance(): Promise<BalanceResult> {
    throw new Error('Canton $CC balance check not yet implemented.');
  }
}