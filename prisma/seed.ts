import { PrismaClient } from "@prisma/client";
import { DEFAULT_CHECKLIST } from "../src/lib/constants/job-checklist";
import { DEFAULT_LEARNING_TASKS } from "../src/lib/constants/learning-tasks";

const prisma = new PrismaClient();

export async function seedForUser(userId: number) {
  await prisma.profile.create({
    data: {
      userId,
      current_role: "",
      years_of_experience: 0,
      tech_stack: "",
      project_experience: "",
    },
  });

  await prisma.jobChecklistItem.createMany({
    data: DEFAULT_CHECKLIST.map((item) => ({ ...item, userId })),
  });

  await prisma.learningTask.createMany({
    data: DEFAULT_LEARNING_TASKS.map((task) => ({ ...task, userId })),
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
