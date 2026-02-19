import { describe, it, expect } from 'vitest';
import { validatePartyId, isValidPartyId } from '@/lib/auth/validate-party-id';

describe('validatePartyId', () => {
  it('validates correct party IDs', () => {
    expect(validatePartyId('texture::1234')).toEqual({
      valid: true,
      org: 'texture',
      identifier: '1234',
    });

    expect(validatePartyId('goldman-sachs::trade-001')).toEqual({
      valid: true,
      org: 'goldman-sachs',
      identifier: 'trade-001',
    });

    expect(validatePartyId('a::b')).toEqual({
      valid: true,
      org: 'a',
      identifier: 'b',
    });
  });

  it('rejects empty input', () => {
    expect(validatePartyId('')).toEqual({
      valid: false,
      error: 'Party-ID is required',
    });

    expect(validatePartyId('   ')).toEqual({
      valid: false,
      error: 'Party-ID is required',
    });
  });

  it('rejects missing separator', () => {
    const result = validatePartyId('nocolon');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('::');
  });

  it('rejects empty org part', () => {
    const result = validatePartyId('::abc');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Organization');
  });

  it('rejects empty identifier part', () => {
    const result = validatePartyId('abc::');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Identifier');
  });

  it('rejects org starting with number', () => {
    const result = validatePartyId('123::abc');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('start with a letter');
  });

  it('rejects multiple separators', () => {
    const result = validatePartyId('a::b::c');
    expect(result.valid).toBe(false);
    expect(result.error).toContain("exactly one '::'");
  });

  it('rejects excessively long input', () => {
    const long = 'a'.repeat(64) + '::' + 'b'.repeat(65);
    const result = validatePartyId(long);
    expect(result.valid).toBe(false);
  });

  it('trims whitespace', () => {
    const result = validatePartyId('  texture::1234  ');
    expect(result.valid).toBe(true);
    expect(result.org).toBe('texture');
  });
});

describe('isValidPartyId', () => {
  it('returns true for valid IDs', () => {
    expect(isValidPartyId('texture::1234')).toBe(true);
  });

  it('returns false for invalid IDs', () => {
    expect(isValidPartyId('')).toBe(false);
    expect(isValidPartyId('nocolon')).toBe(false);
  });
});
