import RoleService from "../services/role.service.js";
import { success } from "../utils/apiResponse.js";

class RoleController {
  async create(req, res, next) {
    try {
      const role = await RoleService.createRole(req.body);
      return success(res, role, "Rôle créé avec succès", 201);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const roles = await RoleService.getRoles();
      return success(res, roles);
    } catch (err) {
      next(err);
    }
  }

  async getOne(req, res, next) {
    try {
      const role = await RoleService.getRoleById(Number(req.params.id));
      return success(res, role);
    } catch (err) {
      next(err);
    }
  }
}

export default new RoleController();
