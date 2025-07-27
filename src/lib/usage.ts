import { RateLimiterPrisma } from "rate-limiter-flexible";
import { prisma } from "./db";
import { auth } from "@clerk/nextjs/server";

const FREE_POINTS = 3; // 3 points per 30 day
const PRO_POINTS = 100; // 100 points per 30 day for pro users
const DURATION = 30 * 24 * 60 * 60; // 30 days
const GENERATION_COST = 1; // 1 point per generation

export async function getUsageTracker() {
  const { has } = await auth();
  const hasProAccess = has({ plan: "pro" });

  const usageTracker = new RateLimiterPrisma({
    storeClient: prisma,
    tableName: "usage",
    points: hasProAccess ? PRO_POINTS : FREE_POINTS, // 100 points for pro users, 3 points for free users
    duration: DURATION, // 30 days
  });
  return usageTracker;
}

export async function consumeCredits() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  const usageTracker = await getUsageTracker();
  const result = await usageTracker.consume(userId, GENERATION_COST); // Consume 1 point

  return result;
}

export async function getUsageStatus() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  const usageTracker = await getUsageTracker();
  const result = await usageTracker.get(userId);

  return result;
}
