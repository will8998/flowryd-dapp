// Canton Party-ID format: orgname::identifier
// orgname: starts with letter, 1-63 chars, [a-z0-9_-]
// identifier: 1-63 chars, [a-z0-9_-]

export interface PartyIdValidationResult {
  valid: boolean;
  org?: string;
  identifier?: string;
  error?: string;
}

const ORG_REGEX = /^[a-z][a-z0-9_-]{0,62}$/i;
const IDENTIFIER_REGEX = /^[a-z0-9_-]{1,128}$/i;

export function validatePartyId(partyId: string): PartyIdValidationResult {
  if (!partyId || partyId.trim().length === 0) {
    return { valid: false, error: 'Party-ID is required' };
  }

  const trimmed = partyId.trim();

  if (trimmed.length > 195) {
    return { valid: false, error: 'Party-ID exceeds maximum length' };
  }

  const separatorIndex = trimmed.indexOf('::');

  if (separatorIndex === -1) {
    return {
      valid: false,
      error: "Party-ID must contain '::' separator (format: orgname::identifier)",
    };
  }

  const org = trimmed.slice(0, separatorIndex);
  const identifier = trimmed.slice(separatorIndex + 2);

  if (org.length === 0) {
    return {
      valid: false,
      error: "Organization part cannot be empty (format: orgname::identifier)",
    };
  }

  if (identifier.length === 0) {
    return {
      valid: false,
      error: "Identifier part cannot be empty (format: orgname::identifier)",
    };
  }

  if (identifier.includes('::')) {
    return {
      valid: false,
      error: "Party-ID must contain exactly one '::' separator",
    };
  }

  if (!ORG_REGEX.test(org)) {
    return {
      valid: false,
      error:
        'Organization part must start with a letter and contain only lowercase letters, numbers, hyphens, and underscores',
    };
  }

  if (!IDENTIFIER_REGEX.test(identifier)) {
    return {
      valid: false,
      error:
        'Identifier part must contain only letters, numbers, hyphens, and underscores',
    };
  }

  return { valid: true, org, identifier };
}

export function isValidPartyId(partyId: string): boolean {
  return validatePartyId(partyId).valid;
}
