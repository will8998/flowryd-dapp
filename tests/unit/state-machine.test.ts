import { describe, it, expect } from 'vitest';
import { validateTransition } from '@/lib/deals/state-machine';

describe('deal state machine', () => {
  it('allows draft → open for admin', () => {
    expect(() => validateTransition('draft', 'open', 'admin', 1)).not.toThrow();
  });

  it('allows draft → open for editor', () => {
    expect(() => validateTransition('draft', 'open', 'editor', 1)).not.toThrow();
  });

  it('blocks draft → open for viewer', () => {
    expect(() => validateTransition('draft', 'open', 'viewer', 1)).toThrow();
  });

  it('allows open → negotiating with 2+ participants', () => {
    expect(() => validateTransition('open', 'negotiating', 'admin', 2)).not.toThrow();
  });

  it('blocks open → negotiating with < 2 participants', () => {
    expect(() => validateTransition('open', 'negotiating', 'admin', 1)).toThrow('2 participants');
  });

  it('allows negotiating → locked for admin only', () => {
    expect(() => validateTransition('negotiating', 'locked', 'admin', 2)).not.toThrow();
    expect(() => validateTransition('negotiating', 'locked', 'editor', 2)).toThrow();
  });

  it('allows locked → committed for admin only', () => {
    expect(() => validateTransition('locked', 'committed', 'admin', 2)).not.toThrow();
    expect(() => validateTransition('locked', 'committed', 'editor', 2)).toThrow();
  });

  it('blocks invalid transitions', () => {
    expect(() => validateTransition('draft', 'negotiating', 'admin', 2)).toThrow();
    expect(() => validateTransition('open', 'committed', 'admin', 2)).toThrow();
    expect(() => validateTransition('committed', 'open', 'admin', 2)).toThrow();
  });

  it('allows admin to reset any state to draft', () => {
    expect(() => validateTransition('open', 'draft', 'admin', 1)).not.toThrow();
    expect(() => validateTransition('negotiating', 'draft', 'admin', 2)).not.toThrow();
    expect(() => validateTransition('locked', 'draft', 'admin', 2)).not.toThrow();
    expect(() => validateTransition('committed', 'draft', 'admin', 2)).not.toThrow();
  });

  it('blocks non-admin from resetting to draft', () => {
    expect(() => validateTransition('open', 'draft', 'editor', 1)).toThrow('admin');
    expect(() => validateTransition('open', 'draft', 'viewer', 1)).toThrow('admin');
  });
});
