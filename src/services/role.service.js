import prisma from "../config/database.js";
import { generateId } from "../utils/idGenerator.js";

class RoleService {
  async createRole({ name }) {
    const id = await generateId("role", "ROLE-");

    return prisma.role.create({
      data: {
        id,
        name,
      },
    });
  }

  async getRoles() {
    return prisma.role.findMany();
  }

  async getRoleById(id) {
    const role = await prisma.role.findUnique({ where: { id } });

    if (!role)
      throw {
        status: 404,
        message: "Rôle introuvable",
        code: "ROLE_NOT_FOUND",
      };

    return role;
  }
}

export default new RoleService();
