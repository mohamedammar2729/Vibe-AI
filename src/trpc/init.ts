import { initTRPC } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: 'user_123' };
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

// Base router (group of functions) and procedure (API functions) helpers
export const createTRPCRouter = t.router;
// This lets you group your API endpoints, containing multiple procedures.
export const createCallerFactory = t.createCallerFactory;
// This lets you call the API from inside the server itself, not from the browser.
export const baseProcedure = t.procedure;
// This is how you create a single API function.
