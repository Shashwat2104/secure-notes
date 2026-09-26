import crypto from "crypto";

// 32-character unambiguous alphabet (avoids 0, O, 1, I, L)
const UNAMBIGUOUS_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Generates an 8-character cryptographically random access key
 * formatted into two 4-character chunks: XXXX-XXXX
 * Provides ~40 bits of entropy (32^8 combinations).
 */
export function generateAccessKey(): string {
  let key = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = crypto.randomInt(0, UNAMBIGUOUS_CHARS.length);
    key += UNAMBIGUOUS_CHARS[randomIndex];
  }
  return `${key.slice(0, 4)}-${key.slice(4, 8)}`;
}

/**
 * Normalizes user-submitted access keys by removing whitespace and hyphens,
 * converting to uppercase.
 */
export function normalizeAccessKey(rawKey: string): string {
  return rawKey.replace(/[\s-]/g, "").toUpperCase();
}
