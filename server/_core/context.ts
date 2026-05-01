import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "@shared/const";
import { parse as parseCookie } from "cookie";
import { getUserByOpenId } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // First try Manus OAuth
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // If OAuth fails, try email/password session cookie
    try {
      const cookieHeader = opts.req.headers.cookie || "";
      const cookies = parseCookie(cookieHeader);
      const sessionId = cookies[COOKIE_NAME];

      if (sessionId) {
        // Look up user by openId (which is the session ID for email/password auth)
        const foundUser = await getUserByOpenId(sessionId);
        if (foundUser) {
          user = foundUser;
        }
      }
    } catch (cookieError) {
      // Cookie parsing failed, user stays null
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
