import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb, getUserByOpenId } from "./db";
import bcrypt from "bcryptjs";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    signUp: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        // Check if email already exists
        const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (existing.length > 0) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Email already registered' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(input.password, 10);
        const openId = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create user
        await db.insert(users).values({
          openId,
          email: input.email,
          passwordHash,
          loginMethod: 'email',
          lastSignedIn: new Date(),
        });

        // Get created user
        const user = await getUserByOpenId(openId);
        if (!user) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        // Set session cookie using Set-Cookie header
        const cookieOptions = getSessionCookieOptions(ctx.req);
        const cookieValue = `${COOKIE_NAME}=${openId}; Path=/; HttpOnly; ${cookieOptions.secure ? 'Secure;' : ''} SameSite=${cookieOptions.sameSite}`;
        ctx.res.setHeader('Set-Cookie', cookieValue);

        return { success: true, user };
      }),
    signIn: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        // Find user by email
        const result = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (result.length === 0) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
        }

        const user = result[0];
        if (!user.passwordHash) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
        }

        // Verify password
        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValid) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
        }

        // Update last signed in
        await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

        // Set session cookie using Set-Cookie header
        const cookieOptions = getSessionCookieOptions(ctx.req);
        const cookieValue = `${COOKIE_NAME}=${user.openId}; Path=/; HttpOnly; ${cookieOptions.secure ? 'Secure;' : ''} SameSite=${cookieOptions.sameSite}`;
        ctx.res.setHeader('Set-Cookie', cookieValue);

        return { success: true, user };
      }),
  }),
});

export type AppRouter = typeof appRouter;
