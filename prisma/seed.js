import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {

  await prisma.role.createMany({
    data: [
      { id: "ROLE-00001", name: "ADMIN" },
      { id: "ROLE-00002", name: "MODERATOR" },
      { id: "ROLE-00003", name: "MEMBER" }
    ],
    skipDuplicates: true
  });

  console.log("Roles successfully inserted");
}

main()
  .finally(() => prisma.$disconnect());
