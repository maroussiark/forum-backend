import { PrismaClient } from "../src/generated/prisma/index.js";
import { ROLES } from "../src/shared/constants/roles.js";
import { PERMISSION_LIST } from "../src/shared/constants/permission.js";
import { ACL } from "../src/shared/constants/acl.js";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 SEEDING…");

  console.log("⚙ Création des permissions...");
  const permissionsMap = {};

  for (const perm of PERMISSION_LIST) {
    const created = await prisma.permission.upsert({
      where: { name: perm },
      update: {},
      create: { name: perm }
    });
    permissionsMap[perm] = created.id;
  }

  console.log("⚙ Création des rôles...");

  const roleIds = {};

  for (const role of Object.values(ROLES)) {
    const createdRole = await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: {
        id: role.id,
        name: role.name
      }
    });

    roleIds[role.name] = createdRole.id;
  }

  console.log("⚙ Mapping Role → Permissions...");

  for (const [roleName, permList] of Object.entries(ACL)) {
    const roleId = roleIds[roleName];

    for (const permName of permList) {
      const permId = permissionsMap[permName];

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId: permId
          }
        },
        update: {},
        create: {
          roleId,
          permissionId: permId
        }
      });
    }
  }

  console.log("⚙ Création admin...");

  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      id: "USER-ADMIN-00001",
      email: "admin@example.com",
      password: passwordHash,
      roleId: ROLES.ADMIN.id
    }
  });

  await prisma.userProfile.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      fullName: "Super Admin"
    }
  });

  console.log("🎉 SEEDING TERMINÉ AVEC SUCCÈS !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
