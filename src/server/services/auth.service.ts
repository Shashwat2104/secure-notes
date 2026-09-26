import { prisma } from "@/lib/db/prisma";
import { hashSecret, verifySecret } from "@/lib/security/hashing";
import { RegisterInput } from "@/lib/validation/auth.schema";

export class AuthService {
  /**
   * Registers a new user with secure Argon2id password hashing.
   * Throws if email already exists.
   */
  static async registerUser(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw new Error("EMAIL_EXISTS");
    }

    const passwordHash = await hashSecret(input.password);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Verifies credentials for login via Auth.js.
   */
  static async verifyCredentials(email: string, plainPassword: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return null;
    }

    const isValid = await verifySecret(user.passwordHash, plainPassword);
    if (!isValid) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
