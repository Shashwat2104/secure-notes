import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Derives a consistent 32-byte encryption key from the environment secret.
 */
function getMasterKey(): Buffer {
  const secret = process.env.ENCRYPTION_MASTER_KEY || process.env.AUTH_SECRET || "default_dev_master_encryption_key_32b!";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts plaintext string using AES-256-GCM.
 * Output format: "enc:v1:<iv_hex>:<auth_tag_hex>:<ciphertext_hex>"
 */
export function encryptPayload(plaintext: string): string {
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let ciphertext = cipher.update(plaintext, "utf8", "hex");
  ciphertext += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `enc:v1:${iv.toString("hex")}:${authTag}:${ciphertext}`;
}

/**
 * Decrypts an AES-256-GCM encrypted payload string.
 * Gracefully returns original plaintext if not prefixed with "enc:v1:" (backward compatibility).
 */
export function decryptPayload(ciphertext: string): string {
  if (!ciphertext.startsWith("enc:v1:")) {
    // Unencrypted legacy record
    return ciphertext;
  }

  const parts = ciphertext.split(":");
  if (parts.length !== 5) {
    throw new Error("Invalid encrypted payload format");
  }

  const [, , ivHex, authTagHex, encryptedHex] = parts;
  const key = getMasterKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
