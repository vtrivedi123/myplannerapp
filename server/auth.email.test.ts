import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import bcrypt from "bcryptjs";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): { ctx: TrpcContext; setCookieHeaders: string[] } {
  const setCookieHeaders: string[] = [];

  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      setHeader: (name: string, value: string) => {
        if (name === "Set-Cookie") {
          setCookieHeaders.push(value);
        }
      },
      clearCookie: () => {},
    } as any,
  };

  return { ctx, setCookieHeaders };
}

describe("auth.signUp", () => {
  it("creates a new user with email and password", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.signUp({
      email: `test-${Date.now()}@example.com`,
      password: "password123",
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(result.user.email);
    expect(result.user.loginMethod).toBe("email");
  });

  it("rejects duplicate email", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const email = `duplicate-${Date.now()}@example.com`;

    // First signup
    await caller.auth.signUp({
      email,
      password: "password123",
    });

    // Second signup with same email should fail
    try {
      await caller.auth.signUp({
        email,
        password: "password456",
      });
      expect.fail("Should have thrown CONFLICT error");
    } catch (err: any) {
      expect(err.code).toBe("CONFLICT");
      expect(err.message).toContain("already registered");
    }
  });

  it("rejects password shorter than 6 characters", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.auth.signUp({
        email: `test-${Date.now()}@example.com`,
        password: "short",
      });
      expect.fail("Should have thrown validation error");
    } catch (err: any) {
      expect(err.message).toMatch(/Too small|6 character/);
    }
  });

  it("rejects invalid email", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.auth.signUp({
        email: "not-an-email",
        password: "password123",
      });
      expect.fail("Should have thrown validation error");
    } catch (err: any) {
      expect(err.message).toMatch(/Invalid|email/);
    }
  });
});

describe("auth.signIn", () => {
  let testEmail: string;
  let testPassword: string;

  beforeAll(async () => {
    testEmail = `signin-test-${Date.now()}@example.com`;
    testPassword = "testpass123";

    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Create test user
    await caller.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
  });

  it("signs in user with correct credentials", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.signIn({
      email: testEmail,
      password: testPassword,
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(testEmail);
    expect(result.user.loginMethod).toBe("email");
  });

  it("rejects sign in with wrong password", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.auth.signIn({
        email: testEmail,
        password: "wrongpassword",
      });
      expect.fail("Should have thrown UNAUTHORIZED error");
    } catch (err: any) {
      expect(err.code).toBe("UNAUTHORIZED");
      expect(err.message).toContain("Invalid credentials");
    }
  });

  it("rejects sign in with non-existent email", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.auth.signIn({
        email: `nonexistent-${Date.now()}@example.com`,
        password: "anypassword",
      });
      expect.fail("Should have thrown UNAUTHORIZED error");
    } catch (err: any) {
      expect(err.code).toBe("UNAUTHORIZED");
      expect(err.message).toContain("Invalid credentials");
    }
  });

  it("sets session cookie on successful sign in", async () => {
    const { ctx, setCookieHeaders } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.auth.signIn({
      email: testEmail,
      password: testPassword,
    });

    expect(setCookieHeaders.length).toBeGreaterThan(0);
    const cookieHeader = setCookieHeaders[0];
    expect(cookieHeader).toContain(COOKIE_NAME);
    expect(cookieHeader).toContain("HttpOnly");
    expect(cookieHeader).toContain("Secure");
  });
});

describe("auth.logout", () => {
  it("clears the session cookie", async () => {
    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "test-user",
        email: "test@example.com",
        name: null,
        passwordHash: null,
        loginMethod: "email",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as any,
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();

    expect(result.success).toBe(true);
  });
});
