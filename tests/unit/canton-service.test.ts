import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MockCantonService } from '@/lib/canton/mock';
import type { 
  DeployContractParams, 
  SubmitTransactionParams,
  CantonTransactionReceipt,
  CantonWalletBalance,
  CantonContractStatus,
  FAMarkerData,
  CantonTransactionHash,
  CantonContractId
} from '@/lib/canton/types';

// Mock crypto.randomUUID for consistent testing
const mockUUID = vi.fn();
vi.stubGlobal('crypto', {
  randomUUID: mockUUID,
});

describe('MockCantonService', () => {
  let service: MockCantonService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUUID.mockReturnValue('test-uuid-123');
    service = new MockCantonService();
  });

  describe('deployContract', () => {
    it('returns correct CantonTransactionReceipt shape', async () => {
      const params: DeployContractParams = {
        templateId: 'test-template',
        participants: ['party1', 'party2'],
        flowId: 'flow-123',
        metadata: { key: 'value' }
      };

      const result = await service.deployContract(params);

      expect(result).toMatchObject({
        transactionHash: expect.stringMatching(/^0x[a-f0-9]{64}$/),
        contractId: 'canton::contract-test-uuid-123',
        status: 'committed',
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        participants: ['party1', 'party2'],
        metadata: { key: 'value' }
      });
    });

    it('generates unique transaction hashes', async () => {
      const params: DeployContractParams = {
        templateId: 'test-template',
        participants: ['party1']
      };

      const result1 = await service.deployContract(params);
      const result2 = await service.deployContract(params);

      expect(result1.transactionHash).not.toBe(result2.transactionHash);
      expect(result1.transactionHash).toMatch(/^0x[a-f0-9]{64}$/);
      expect(result2.transactionHash).toMatch(/^0x[a-f0-9]{64}$/);
    });

    it('handles minimal params without optional fields', async () => {
      const params: DeployContractParams = {
        templateId: 'minimal-template',
        participants: ['single-party']
      };

      const result = await service.deployContract(params);

      expect(result.participants).toEqual(['single-party']);
      expect(result.metadata).toBeUndefined();
    });
  });

  describe('getWalletBalance', () => {
    it('returns correct CantonWalletBalance shape', async () => {
      const walletAddress = '0x1234567890abcdef';

      const result = await service.getWalletBalance(walletAddress);

      expect(result).toMatchObject({
        walletAddress: '0x1234567890abcdef',
        balanceCC: '15000.00',
        balanceUSD: '450.00',
        lastUpdated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      });
    });

    it('preserves wallet address in response', async () => {
      const addresses = ['0xabc123', '0xdef456', 'canton::wallet-789'];

      for (const address of addresses) {
        const result = await service.getWalletBalance(address);
        expect(result.walletAddress).toBe(address);
      }
    });
  });

  describe('submitTransaction', () => {
    it('returns correct CantonTransactionReceipt shape', async () => {
      const params: SubmitTransactionParams = {
        contractId: 'canton::contract-existing' as CantonContractId,
        choice: 'UpdateStatus',
        argument: { status: 'active', value: 100 },
        actAs: 'party-actor'
      };

      const result = await service.submitTransaction(params);

      expect(result).toMatchObject({
        transactionHash: expect.stringMatching(/^0x[a-f0-9]{64}$/),
        contractId: 'canton::contract-existing',
        status: 'committed',
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        participants: ['party-actor'],
        metadata: {
          choice: 'UpdateStatus',
          argument: { status: 'active', value: 100 }
        }
      });
    });

    it('includes choice and argument in metadata', async () => {
      const params: SubmitTransactionParams = {
        contractId: 'canton::contract-test' as CantonContractId,
        choice: 'Transfer',
        argument: { from: 'alice', to: 'bob', amount: 500 },
        actAs: 'alice'
      };

      const result = await service.submitTransaction(params);

      expect(result.metadata).toEqual({
        choice: 'Transfer',
        argument: { from: 'alice', to: 'bob', amount: 500 }
      });
    });
  });

  describe('getFAMarkers', () => {
    it('returns array of FAMarkerData with correct shape', async () => {
      const flowId = 'flow-test-123';

      const result = await service.getFAMarkers(flowId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(3);
      expect(result.length).toBeLessThanOrEqual(5);

      result.forEach(marker => {
        expect(marker).toMatchObject({
          flowId: 'flow-test-123',
          appName: expect.stringMatching(/^(C7 Identity|Kaiko|Canton Wallet|Flowryd|DeFi Bridge)$/),
          markerCount: expect.any(Number),
          rewardCC: expect.stringMatching(/^\d+\.\d{2}$/),
          multiplier: expect.any(Number),
          generatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        });
        expect(marker.markerCount).toBeGreaterThanOrEqual(10);
        expect(marker.markerCount).toBeLessThanOrEqual(59);
        expect(marker.multiplier).toBeGreaterThanOrEqual(1);
        expect(marker.multiplier).toBeLessThanOrEqual(100);
      });
    });

    it('preserves flowId in all markers', async () => {
      const flowId = 'unique-flow-456';

      const result = await service.getFAMarkers(flowId);

      result.forEach(marker => {
        expect(marker.flowId).toBe('unique-flow-456');
      });
    });

    it('generates different data on multiple calls', async () => {
      const flowId = 'flow-random-test';

      const result1 = await service.getFAMarkers(flowId);
      const result2 = await service.getFAMarkers(flowId);

      // Should have different random values (very unlikely to be identical)
      const markers1Str = JSON.stringify(result1);
      const markers2Str = JSON.stringify(result2);
      expect(markers1Str).not.toBe(markers2Str);
    });
  });

  describe('getContractStatus', () => {
    it('returns correct CantonContractStatus shape', async () => {
      const contractId = 'canton::contract-status-test';

      const result = await service.getContractStatus(contractId);

      expect(result).toMatchObject({
        contractId: 'canton::contract-status-test',
        templateId: 'template-test-uuid-123',
        status: 'active',
        createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        participants: expect.arrayContaining([
          expect.stringMatching(/^party-test-uuid-123$/),
          expect.stringMatching(/^party-test-uuid-123$/)
        ]),
        lastActivityAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      });
    });

    it('preserves contractId in response', async () => {
      const contractIds = [
        'canton::contract-abc',
        'canton::contract-def',
        'test-contract-123'
      ];

      for (const contractId of contractIds) {
        const result = await service.getContractStatus(contractId);
        expect(result.contractId).toBe(contractId);
      }
    });

    it('generates two participants', async () => {
      const result = await service.getContractStatus('test-contract');

      expect(result.participants).toHaveLength(2);
      expect(result.participants[0]).toMatch(/^party-/);
      expect(result.participants[1]).toMatch(/^party-/);
    });

    it('ensures lastActivityAt is after createdAt', async () => {
      const result = await service.getContractStatus('test-contract');

      const createdAt = new Date(result.createdAt);
      const lastActivityAt = new Date(result.lastActivityAt);

      expect(lastActivityAt.getTime()).toBeGreaterThanOrEqual(createdAt.getTime());
    });
  });
});