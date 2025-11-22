import UsersService from "./users.service.js";
import { success } from "../../utils/apiResponse.js";

class UsersController {

  async getUser(req, res) {
    const user = await UsersService.getById(req.params.userId);
    return success(res, user);
  }

  async updateUser(req, res) {
    const updated = await UsersService.updateUser(
      req.params.userId,
      req.user.id,
      req.user.isModerator,
      req.body
    );

    return success(res, updated, "Utilisateur mis à jour");
  }

  async deleteUser(req, res) {
    await UsersService.softDelete(
      req.params.userId,
      req.user.id,
      req.user.isModerator
    );

    return success(res, null, "Utilisateur supprimé");
  }

}

export default new UsersController();
