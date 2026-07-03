import { createHash } from 'crypto';

// Server-only secret material. Falls back to the service-role key so it works
// without extra env setup; set PIN_PEPPER explicitly to decouple from key rotation.
const PEPPER =
  process.env.PIN_PEPPER || process.env.SUPABASE_SERVICE_ROLE_KEY || 'sawai-pin-pepper-v1';

export function isValidPin(pin: unknown): pin is string {
  return typeof pin === 'string' && /^\d{4}$/.test(pin);
}

/**
 * Deterministic Supabase Auth password derived from a 4-digit PIN. Server-only.
 * The real PIN stays in profiles.pin (admin-viewable); the derived value is the
 * actual auth password so PIN sign-in works via signInWithPassword.
 */
export function derivePassword(pin: string): string {
  return 'pin_' + createHash('sha256').update(`${PEPPER}:${pin}`).digest('hex');
}
