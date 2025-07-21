// This file sets up the server-side version of your tRPC tools.

// It helps your server (like a page running on the backend in Next.js) talk to your API and fetch or cache data — without using the network like the browser would.

import 'server-only'; // <-- ensure this file cannot be imported from the client
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'; //Helps create tRPC helpers on the server.
import { cache } from 'react'; // Remembers the result of a function during a request
import { createTRPCContext } from './init'; // Gives info like the user (from your init.ts)
import { makeQueryClient } from './query-client'; // Creates a QueryClient for fetching and caching data
import { appRouter } from './routers/_app'; // Your main API router that contains all your API functions

// This creates one shared query client during a single request.
// So if you call trpc.user.get() 3 times in one server call, it doesn't fetch 3 times.
// It’s like saying: “Let’s share the same tool instead of making a new one each time.”
export const getQueryClient = cache(makeQueryClient);
// This function creates a trpc object you can use on the server to call any API function directly
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext, // Provide user info or session to your API
  router: appRouter, // Use all your API procedures (like getUser, createPost, etc.)
  queryClient: getQueryClient, // Use the shared query client to fetch and cache data
});

export const caller = appRouter.createCaller(createTRPCContext);

// You can now call your backend API directly from server components or actions like this:
// const user = await trpc.user.get.query(); // get user data directly on server