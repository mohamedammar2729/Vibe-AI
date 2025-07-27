import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { consumeCredits } from "@/lib/usage";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

import { z } from "zod";

export const messagesRouter = createTRPCRouter({
  // Define your procedures here
  create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "Message is required" })
          .max(10000, { message: "Message is too long" }),
        projectId: z.string().min(1, { message: "Project ID is required" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.auth.userId, // Ensure the project belongs to the authenticated user
        },
      });
      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      try {
        await consumeCredits();
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Something went wrong",
          });
        } else {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "You have run out of credits",
          });
        }
      }

      const createMessage = await prisma.message.create({
        data: {
          projectId: existingProject.id,
          content: input.value,
          role: "USER", // Assuming the role is 'user' for this example
          type: "RESULT", // Replace with actual conversation ID logic
        },
      });

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: input.projectId,
        },
      });
      return createMessage;
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: "Project ID is required" }),
      })
    )
    .query(async ({ input, ctx }) => {
      const messages = await prisma.message.findMany({
        orderBy: {
          createdAt: "asc",
        },
        where: {
          projectId: input.projectId,
          Project: {
            userId: ctx.auth.userId, // Ensure the messages belong to the authenticated user's project
          },
        },
        include: {
          Fragment: true, // Include related fragment data if needed
        },
      });
      return messages;
    }),
});
