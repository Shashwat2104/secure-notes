import crypto from "crypto";

/**
 * Generates a cryptographically secure random token (256 bits of entropy)
 * and its SHA-256 hash for secure storage at rest.
 */
export function generateShareToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashShareToken(rawToken);
  return { rawToken, tokenHash };
}

/**
 * Computes the deterministic SHA-256 hash of a raw share token.
 */
export function hashShareToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}
