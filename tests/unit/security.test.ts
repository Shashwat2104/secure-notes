import { describe, it, expect } from "vitest";
import { generateShareToken, hashShareToken } from "@/lib/security/tokens";
import { hashSecret, verifySecret } from "@/lib/security/hashing";
import { generateAccessKey, normalizeAccessKey } from "@/lib/security/access-key";

describe("Security Utilities: Tokens", () => {
  it("generates a high-entropy URL-safe base64 token and valid SHA-256 hash", () => {
    const { rawToken, tokenHash } = generateShareToken();

    expect(rawToken).toBeDefined();
    // 32 bytes in base64url is 43 characters
    expect(rawToken.length).toBe(43);
    // Base64URL charset: alphanumeric plus - and _
    expect(/^[A-Za-z0-9_-]+$/.test(rawToken)).toBe(true);

    // SHA-256 is 64 hex characters
    expect(tokenHash).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(tokenHash)).toBe(true);
  });

  it("produces deterministic SHA-256 hashes for the same token", () => {
    const raw = "test-token-value-12345";
    const hash1 = hashShareToken(raw);
    const hash2 = hashShareToken(raw);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it("produces distinct hashes for different tokens", () => {
    const hashA = hashShareToken("token-a");
    const hashB = hashShareToken("token-b");

    expect(hashA).not.toBe(hashB);
  });
});

describe("Security Utilities: Argon2id Hashing", () => {
  it("hashes and correctly verifies passwords and access keys", async () => {
    const secret = "SuperSecretKey99!";
    const hashed = await hashSecret(secret);

    expect(hashed).toBeDefined();
    expect(hashed.startsWith("$argon2id$")).toBe(true);

    const isMatch = await verifySecret(hashed, secret);
    expect(isMatch).toBe(true);

    const isWrong = await verifySecret(hashed, "WrongPassword123!");
    expect(isWrong).toBe(false);
  });

  it("produces different hashes for the same plaintext due to random salts", async () => {
    const secret = "SharedPassword123!";
    const hash1 = await hashSecret(secret);
    const hash2 = await hashSecret(secret);

    expect(hash1).not.toBe(hash2);
    expect(await verifySecret(hash1, secret)).toBe(true);
    expect(await verifySecret(hash2, secret)).toBe(true);
  });
});

describe("Security Utilities: Dynamic Access Key Generator", () => {
  it("generates an 8-character key formatted as XXXX-XXXX using unambiguous characters", () => {
    const key = generateAccessKey();

    expect(key).toHaveLength(9); // 4 + 1 + 4
    expect(key.charAt(4)).toBe("-");

    // Unambiguous chars: 2-9, A-Z excluding 0, 1, O, I, L
    const validCharset = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/;
    expect(validCharset.test(key)).toBe(true);
  });

  it("generates unique keys across invocations", () => {
    const keys = new Set();
    for (let i = 0; i < 50; i++) {
      keys.add(generateAccessKey());
    }
    expect(keys.size).toBe(50);
  });

  it("normalizes access keys by stripping spaces and hyphens", () => {
    const normalized = normalizeAccessKey(" k8f4 - x92m ");
    expect(normalized).toBe("K8F4X92M");
  });
});

describe("Security Utilities: AES-256-GCM Payload Encryption at Rest", () => {
  it("encrypts and decrypts sensitive content round-trip", async () => {
    const { encryptPayload, decryptPayload } = await import("@/lib/security/encryption");
    const secretText = "Classified confidential note payload with symbols & emojis 🔒 🚀";
    const encrypted = encryptPayload(secretText);

    expect(encrypted.startsWith("enc:v1:")).toBe(true);
    expect(encrypted).not.toContain(secretText);

    const decrypted = decryptPayload(encrypted);
    expect(decrypted).toBe(secretText);
  });

  it("produces non-deterministic ciphertext due to random 96-bit IVs", async () => {
    const { encryptPayload } = await import("@/lib/security/encryption");
    const secretText = "Repeated confidential string";
    const enc1 = encryptPayload(secretText);
    const enc2 = encryptPayload(secretText);

    expect(enc1).not.toBe(enc2);
  });

  it("fails decryption if auth tag or ciphertext is tampered with", async () => {
    const { encryptPayload, decryptPayload } = await import("@/lib/security/encryption");
    const secretText = "Tamper detection test";
    const encrypted = encryptPayload(secretText);
    const parts = encrypted.split(":");
    // Tamper with the ciphertext component
    parts[3] = parts[3].slice(0, -2) + "ff";
    const tampered = parts.join(":");

    expect(() => decryptPayload(tampered)).toThrow();
  });

  it("transparently supports legacy unencrypted payloads", async () => {
    const { decryptPayload } = await import("@/lib/security/encryption");
    const legacyPlaintext = "Legacy unencrypted note from previous version";
    const result = decryptPayload(legacyPlaintext);
    expect(result).toBe(legacyPlaintext);
  });
});

