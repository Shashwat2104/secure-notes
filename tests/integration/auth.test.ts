import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { AuthService } from "@/server/services/auth.service";
import { registerSchema } from "@/lib/validation/auth.schema";

describe("Authentication & Registration Integration", () => {
  const testEmail = `auth_test_${Date.now()}@example.com`;

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
  });

  it("registers a user and verifies credentials using Argon2id", async () => {
    const user = await AuthService.registerUser({
      name: "Arthur Dent",
      email: testEmail,
      password: "Password42!",
      confirmPassword: "Password42!",
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(user.name).toBe("Arthur Dent");

    // Successful credential verification
    const verified = await AuthService.verifyCredentials(testEmail, "Password42!");
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(user.id);
    expect(verified?.email).toBe(testEmail);

    // Failed credential verification (wrong password)
    const wrongPass = await AuthService.verifyCredentials(testEmail, "WrongPassword99!");
    expect(wrongPass).toBeNull();

    // Failed credential verification (non-existent email)
    const nonExistent = await AuthService.verifyCredentials("nonexistent@example.com", "Password42!");
    expect(nonExistent).toBeNull();
  });

  it("rejects duplicate email registration", async () => {
    await expect(
      AuthService.registerUser({
        name: "Duplicate User",
        email: testEmail,
        password: "Password42!",
        confirmPassword: "Password42!",
      })
    ).rejects.toThrow("EMAIL_EXISTS");
  });

  it("validates registration schema and rejects weak passwords", () => {
    const weakPassResult = registerSchema.safeParse({
      name: "Weak User",
      email: "weak@example.com",
      password: "weak",
      confirmPassword: "weak",
    });
    expect(weakPassResult.success).toBe(false);

    const mismatchedResult = registerSchema.safeParse({
      name: "Mismatch User",
      email: "mismatch@example.com",
      password: "Password123!",
      confirmPassword: "DifferentPassword123!",
    });
    expect(mismatchedResult.success).toBe(false);
  });
});
