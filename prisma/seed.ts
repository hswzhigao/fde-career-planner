import { fileURLToPath } from "node:url";
import { prisma } from "../src/lib/db";
import { seedForUser } from "../src/lib/seed-user";

export { seedForUser };

async function main() {
  console.log("Seed is now user-scoped. Create an account through /register to initialize data.");
}

const isCliRun = process.argv[1] === fileURLToPath(import.meta.url);

if (isCliRun) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
