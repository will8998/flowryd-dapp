import type { PaymentProvider } from './payment-adapter';
import { MockPaymentProvider } from './payment-adapter';

export type { PaymentProvider, ChargeResult, RefundResult, BalanceResult } from './payment-adapter';
export * from './types';

let _provider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (!_provider) {
    _provider = new MockPaymentProvider();
  }
  return _provider;
}