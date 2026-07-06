import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "./db";
import { DEFAULT_CHECKLIST } from "./constants/job-checklist";
import { DEFAULT_LEARNING_TASKS } from "./constants/learning-tasks";

type SeedClient = PrismaClient | Prisma.TransactionClient;

async function seedUserDefaults(userId: number, client: Prisma.TransactionClient) {
  const user = await client.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const profile = await client.profile.findFirst({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    await client.profile.create({
      data: {
        userId,
        current_role: "",
        years_of_experience: 0,
        tech_stack: "",
        project_experience: "",
      },
    });
  }

  const existingChecklistItems = await client.jobChecklistItem.findMany({
    where: { userId },
    select: { section: true, title: true },
  });
  const existingChecklistKeys = new Set(
    existingChecklistItems.map((item) => `${item.section}:${item.title}`),
  );
  const checklistItemsToCreate = DEFAULT_CHECKLIST.filter(
    (item) => !existingChecklistKeys.has(`${item.section}:${item.title}`),
  ).map((item) => ({ ...item, userId }));

  if (checklistItemsToCreate.length > 0) {
    await client.jobChecklistItem.createMany({
      data: checklistItemsToCreate,
    });
  }

  const existingLearningTasks = await client.learningTask.findMany({
    where: { userId },
    select: { phase: true, title: true },
  });
  const existingLearningTaskKeys = new Set(
    existingLearningTasks.map((task) => `${task.phase}:${task.title}`),
  );
  const learningTasksToCreate = DEFAULT_LEARNING_TASKS.filter(
    (task) => !existingLearningTaskKeys.has(`${task.phase}:${task.title}`),
  ).map((task) => ({ ...task, userId }));

  if (learningTasksToCreate.length > 0) {
    await client.learningTask.createMany({
      data: learningTasksToCreate,
    });
  }
}

export async function seedForUser(userId: number, client: SeedClient = prisma) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid userId");
  }

  if ("$transaction" in client) {
    await client.$transaction(async (tx) => {
      await seedUserDefaults(userId, tx);
    });
    return;
  }

  await seedUserDefaults(userId, client);
}
