import RoleService from "../services/role.service.js";
import { success } from "../utils/apiResponse.js";

class RoleController {
  async create(req, res) {
      const role = await RoleService.createRole(req.body);
      return success(res, role, "Rôle créé avec succès", 201);
  }

  async getAll(req, res) {
      const roles = await RoleService.getRoles();
      return success(res, roles);
  }

  async getOne(req, res) {
      const role = await RoleService.getRoleById(req.params.id);
      return success(res, role);
  }
}

export default new RoleController();
