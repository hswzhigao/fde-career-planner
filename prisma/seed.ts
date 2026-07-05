import { PrismaClient } from "@prisma/client";
import { DEFAULT_CHECKLIST } from "../src/lib/constants/job-checklist";
import { DEFAULT_LEARNING_TASKS } from "../src/lib/constants/learning-tasks";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  // 清空已有数据
  await prisma.aiSummary.deleteMany();
  await prisma.weeklyLog.deleteMany();
  await prisma.learningTask.deleteMany();
  await prisma.jobChecklistItem.deleteMany();
  await prisma.skillAssessment.deleteMany();
  await prisma.profile.deleteMany();

  // Profile 占位
  await prisma.profile.create({
    data: {
      current_role: "",
      years_of_experience: 0,
      tech_stack: "",
      project_experience: "",
    },
  });

  // Job checklist
  for (const item of DEFAULT_CHECKLIST) {
    await prisma.jobChecklistItem.create({ data: item });
  }

  // Learning tasks
  for (const task of DEFAULT_LEARNING_TASKS) {
    await prisma.learningTask.create({ data: task });
  }

  console.log(`Seeded: 1 profile, ${DEFAULT_CHECKLIST.length} checklist items, ${DEFAULT_LEARNING_TASKS.length} learning tasks`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
