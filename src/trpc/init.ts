import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";

export const createTRPCContext = cache(async () => {
  return { auth: await auth() };
});
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }
  return next({ ctx: { auth: ctx.auth } });
});

// Base router (group of functions) and procedure (API functions) helpers
export const createTRPCRouter = t.router;
// This lets you group your API endpoints, containing multiple procedures.
export const createCallerFactory = t.createCallerFactory;
// This lets you call the API from inside the server itself, not from the browser.
export const baseProcedure = t.procedure;
// This is how you create a single API function.

export const protectedProcedure = t.procedure.use(isAuthed);
// This is how you create a single API function that requires authentication.