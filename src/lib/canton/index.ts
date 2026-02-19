import type { CantonService } from './interface';
import { MockCantonService } from './mock';

export type { CantonService } from './interface';
export * from './types';

let _service: CantonService | null = null;

export function getCantonService(): CantonService {
  if (!_service) {
    _service = new MockCantonService();
  }
  return _service;
}