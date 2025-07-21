// QueryClient: The brain that controls fetching/caching in React Query.

// defaultShouldDehydrateQuery: A helper function to decide which data to send to the client.

// superjson: Helps convert complex data (like Date, Map, etc.) into something you can send in JSON.

import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from '@tanstack/react-query';
import superjson from 'superjson';

// creating a function that returns a new QueryClient.
// This lets you use it anywhere, and create fresh instances (for example, per request in Next.js).
export function makeQueryClient() {
  return new QueryClient({
    // This sets default settings for queries.

    // staleTime: 30 * 1000: Data is considered fresh for 30 seconds.

    // No auto-refetching happens during that time.
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      // Dehydrate means: preparing data on the server to send to the client.

      // serializeData: Use superjson to convert complex data into something that can be sent via JSON.

      // shouldDehydrateQuery: Decide which queries to include.

      // Keep the default logic ✅

      // Also include queries that are still pending
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
      // Hydration = taking the data sent from the server and restoring it on the client.
      // use superjson to bring complex data back to normal.
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}
