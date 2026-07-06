import { PrismaClient } from "@prisma/client";
import { DEFAULT_CHECKLIST } from "../src/lib/constants/job-checklist";
import { DEFAULT_LEARNING_TASKS } from "../src/lib/constants/learning-tasks";

const prisma = new PrismaClient();

export async function seedForUser(userId: number) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid userId");
  }

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const profile = await tx.profile.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      await tx.profile.create({
        data: {
          userId,
          current_role: "",
          years_of_experience: 0,
          tech_stack: "",
          project_experience: "",
        },
      });
    }

    const existingChecklistItems = await tx.jobChecklistItem.findMany({
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
      await tx.jobChecklistItem.createMany({
        data: checklistItemsToCreate,
      });
    }

    const existingLearningTasks = await tx.learningTask.findMany({
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
      await tx.learningTask.createMany({
        data: learningTasksToCreate,
      });
    }
  });
}

async function main() {
  console.log("Seed is now user-scoped. Create an account through /register to initialize data.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
