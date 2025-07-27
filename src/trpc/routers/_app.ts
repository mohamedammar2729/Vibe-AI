import { messagesRouter } from '@/modules/messages/server/procedures';
import { createTRPCRouter } from '../init';
import { projectsRouter } from '@/modules/projects/server/procedures';
import { usageRouter } from '@/modules/usage/server/procedures';

export const appRouter = createTRPCRouter({
  messages: messagesRouter,
  projects: projectsRouter,
  usage: usageRouter, // Assuming you want to keep the usage router under projects
});
// export type definition of API
export type AppRouter = typeof appRouter;
