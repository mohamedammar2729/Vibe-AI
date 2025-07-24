import { inngest } from '@/inngest/client';
import { prisma } from '@/lib/db';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { z } from 'zod';

export const messagesRouter = createTRPCRouter({
  // Define your procedures here
  create: baseProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: 'Message is required' })
          .max(10000, { message: 'Message is too long' }),
        projectId: z.string().min(1, { message: 'Project ID is required' }),
      })
    )
    .mutation(async ({ input }) => {
      const createMessage = await prisma.message.create({
        data: {
          projectId: input.projectId,
          content: input.value,
          role: 'USER', // Assuming the role is 'user' for this example
          type: 'RESULT', // Replace with actual conversation ID logic
        },
      });

      await inngest.send({
        name: 'code-agent/run',
        data: {
          value: input.value,
          projectId: input.projectId,
        },
      });
      return createMessage;
    }),

  getMany: baseProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: 'Project ID is required' }),
      })
    )
    .query(async ({ input }) => {
      const messages = await prisma.message.findMany({
        orderBy: {
          createdAt: 'asc',
        },
        where: {
          projectId: input.projectId,
        },
        include: {
          Fragment: true, // Include related fragment data if needed
        },
      });
      return messages;
    }),
});
