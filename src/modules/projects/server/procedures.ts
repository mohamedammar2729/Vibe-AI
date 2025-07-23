import { inngest } from '@/inngest/client';
import { prisma } from '@/lib/db';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { z } from 'zod';
import { generateSlug } from 'random-word-slugs';

export const projectsRouter = createTRPCRouter({
  // Define your procedures here
  create: baseProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: 'Value is required' })
          .max(10000, { message: 'Value is too long' }),
      })
    )
    .mutation(async ({ input }) => {
      const createProject = await prisma.project.create({
        data: {
          name: generateSlug(2, {
            format: 'kebab',
          }),
          messages: {
            create: {
              content: input.value,
              role: 'USER', // Assuming the role is 'user' for this example
              type: 'RESULT', // Replace with actual conversation ID logic
            },
          },
        },
      });

      await inngest.send({
        name: 'code-agent/run',
        data: {
          value: input.value,
          projectId: createProject.id,
        },
      });
      return createProject;
    }),

  getMany: baseProcedure.query(async () => {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      // include: {
      //   messages: true, // Include related messages data
      // },
    });
    return projects;
  }),
});
