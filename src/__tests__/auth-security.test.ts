import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, signToken, verifyToken } from "@/lib/auth";
import { Role } from "@prisma/client";

describe("Authentication & Security Helpers", () => {
  it("correctly hashes and verifies passwords using bcrypt", async () => {
    const rawPassword = "SuperSecretPassword@2026";
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    expect(hash.startsWith("$2")).toBe(true);

    const isMatch = await verifyPassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isFalseMatch = await verifyPassword("WrongPassword123", hash);
    expect(isFalseMatch).toBe(false);
  });

  it("signs and verifies JOSE JWT session tokens securely", async () => {
    const userPayload = {
      userId: "test-user-123",
      name: "Student Candidate",
      email: "candidate@university.edu",
      role: Role.STUDENT,
      isActive: true,
    };

    const token = await signToken(userPayload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const verified = await verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(userPayload.userId);
    expect(verified?.email).toBe(userPayload.email);
    expect(verified?.role).toBe(Role.STUDENT);
    expect(verified?.isActive).toBe(true);
  });

  it("rejects tampered or malformed JWT tokens", async () => {
    const fakeToken = "invalid.token.payload";
    const verified = await verifyToken(fakeToken);
    expect(verified).toBeNull();
  });
});

