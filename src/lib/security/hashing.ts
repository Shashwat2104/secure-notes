import { hash, verify } from "@node-rs/argon2";

// Argon2id is algorithm: 2 (the library default)
const ARGON2_OPTIONS = {
  memoryCost: 65536, // 64 MB
  timeCost: 3,       // 3 iterations
  parallelism: 1,    // 1 thread
  algorithm: 2,      // Argon2id
};

/**
 * Computes the Argon2id hash for a password or access key.
 */
export async function hashSecret(plainSecret: string): Promise<string> {
  return await hash(plainSecret, ARGON2_OPTIONS);
}

/**
 * Verifies a candidate plain secret against an Argon2id hash.
 * Returns true if matching, false otherwise.
 */
export async function verifySecret(hashedSecret: string, candidate: string): Promise<boolean> {
  try {
    return await verify(hashedSecret, candidate, ARGON2_OPTIONS);
  } catch (error) {
    return false;
  }
}
