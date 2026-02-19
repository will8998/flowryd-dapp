import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  MockPaymentProvider, 
  CantonCCPaymentProvider,
  type ChargeResult,
  type RefundResult,
  type BalanceResult
} from '@/lib/billing/payment-adapter';

const mockUUID = vi.fn();
vi.stubGlobal('crypto', {
  randomUUID: mockUUID,
});

describe('MockPaymentProvider', () => {
  let provider: MockPaymentProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUUID.mockReturnValue('test-uuid-123');
    provider = new MockPaymentProvider();
  });

  describe('createCharge', () => {
    it('returns successful ChargeResult with correct shape', async () => {
      const params = {
        amount: 100.50,
        currency: '$CC',
        walletAddress: '0x1234567890abcdef',
        description: 'Test subscription charge'
      };

      const result = await provider.createCharge(params);

      expect(result).toMatchObject({
        chargeId: 'mock_charge_test-uuid-123',
        status: 'success',
        amount: 100.50,
        currency: '$CC',
        transactionHash: expect.stringMatching(/^0x[a-f0-9]{64}$/),
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      });
    });

    it('preserves all input parameters in result', async () => {
      const params = {
        amount: 250.75,
        currency: 'USD',
        walletAddress: 'canton::wallet-abc',
        description: 'Premium plan upgrade'
      };

      const result = await provider.createCharge(params);

      expect(result.amount).toBe(250.75);
      expect(result.currency).toBe('USD');
    });

    it('generates unique transaction hashes', async () => {
      const params = {
        amount: 50,
        currency: '$CC',
        walletAddress: '0xtest',
        description: 'Test'
      };

      const result1 = await provider.createCharge(params);
      const result2 = await provider.createCharge(params);

      expect(result1.transactionHash).not.toBe(result2.transactionHash);
      expect(result1.transactionHash).toMatch(/^0x[a-f0-9]{64}$/);
      expect(result2.transactionHash).toMatch(/^0x[a-f0-9]{64}$/);
    });

    it('handles edge case amounts', async () => {
      const testCases = [
        { amount: 0, description: 'zero amount' },
        { amount: 0.01, description: 'minimum amount' },
        { amount: 999999.99, description: 'large amount' }
      ];

      for (const testCase of testCases) {
        const params = {
          amount: testCase.amount,
          currency: '$CC',
          walletAddress: '0xtest',
          description: testCase.description
        };

        const result = await provider.createCharge(params);
        expect(result.status).toBe('success');
        expect(result.amount).toBe(testCase.amount);
      }
    });
  });

  describe('refund', () => {
    it('returns successful RefundResult with correct shape', async () => {
      const chargeId = 'charge_12345';

      const result = await provider.refund(chargeId);

      expect(result).toMatchObject({
        refundId: 'mock_refund_test-uuid-123',
        chargeId: 'charge_12345',
        status: 'success',
        amount: 0,
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      });
    });

    it('preserves chargeId in response', async () => {
      const chargeIds = ['charge_abc', 'mock_charge_def', 'test-charge-123'];

      for (const chargeId of chargeIds) {
        const result = await provider.refund(chargeId);
        expect(result.chargeId).toBe(chargeId);
      }
    });

    it('always returns zero amount for mock refunds', async () => {
      const result = await provider.refund('any-charge-id');
      expect(result.amount).toBe(0);
    });
  });

  describe('getBalance', () => {
    it('returns BalanceResult with correct shape', async () => {
      const walletAddress = '0x1234567890abcdef';

      const result = await provider.getBalance(walletAddress);

      expect(result).toMatchObject({
        walletAddress: '0x1234567890abcdef',
        balance: '15000.00',
        currency: '$CC'
      });
    });

    it('preserves wallet address in response', async () => {
      const addresses = ['0xabc123', 'canton::wallet-456', 'test-wallet'];

      for (const address of addresses) {
        const result = await provider.getBalance(address);
        expect(result.walletAddress).toBe(address);
      }
    });

    it('always returns same mock balance', async () => {
      const result1 = await provider.getBalance('wallet1');
      const result2 = await provider.getBalance('wallet2');

      expect(result1.balance).toBe('15000.00');
      expect(result2.balance).toBe('15000.00');
      expect(result1.currency).toBe('$CC');
      expect(result2.currency).toBe('$CC');
    });
  });
});

describe('CantonCCPaymentProvider', () => {
  let provider: CantonCCPaymentProvider;

  beforeEach(() => {
    provider = new CantonCCPaymentProvider();
  });

  describe('createCharge', () => {
    it('throws error with meaningful message', async () => {
      await expect(provider.createCharge()).rejects.toThrow(
        'Canton $CC payment integration not yet implemented. Configure CANTON_WALLET_API_URL to enable.'
      );
    });

    it('throws Error instance', async () => {
      try {
        await provider.createCharge();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('refund', () => {
    it('throws error with meaningful message', async () => {
      await expect(provider.refund()).rejects.toThrow(
        'Canton $CC refund integration not yet implemented.'
      );
    });

    it('throws Error instance', async () => {
      try {
        await provider.refund();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('getBalance', () => {
    it('throws error with meaningful message', async () => {
      await expect(provider.getBalance()).rejects.toThrow(
        'Canton $CC balance check not yet implemented.'
      );
    });

    it('throws Error instance', async () => {
      try {
        await provider.getBalance();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('all methods throw consistently', () => {
    it('all methods are async and throw errors', async () => {
      const methods = [
        () => provider.createCharge(),
        () => provider.refund(),
        () => provider.getBalance()
      ];

      for (const method of methods) {
        await expect(method()).rejects.toThrow();
      }
    });
  });
});