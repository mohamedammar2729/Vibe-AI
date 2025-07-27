import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { generateSlug } from "random-word-slugs";
import { TRPCError } from "@trpc/server";
import { consumeCredits } from "@/lib/usage";

export const projectsRouter = createTRPCRouter({
  // Define your procedures here
  create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "Value is required" })
          .max(10000, { message: "Value is too long" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
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
      const createProject = await prisma.project.create({
        data: {
          userId: ctx.auth.userId, // Assuming you have user context
          name: generateSlug(2, {
            format: "kebab",
          }),
          messages: {
            create: {
              content: input.value,
              role: "USER", // Assuming the role is 'user' for this example
              type: "RESULT", // Replace with actual conversation ID logic
            },
          },
        },
      });

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: createProject.id,
        },
      });
      return createProject;
    }),

  getMany: protectedProcedure.query(async ({ ctx }) => {
    const projects = await prisma.project.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return projects;
  }),
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "Id is required" }),
      })
    )
    .query(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId, // Ensure the project belongs to the authenticated user
        },
      });
      if (!project) {
        throw new TRPCError({
          message: "Project not found",
          code: "NOT_FOUND",
        });
      }
      return project;
    }),
});
