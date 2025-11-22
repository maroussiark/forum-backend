import UserService from "../services/user.service.js";
import { success } from "../utils/apiResponse.js";

class UserController {
  async updateProfile(req, res) {
    const user = await UserService.updateProfile(req.params.id, req.body);
    return success(res, user, "Profil mis à jour");
  }

  async updatePassword(req, res) {
    const { oldPassword, newPassword } = req.body;
    await UserService.updatePassword(req.params.id, oldPassword, newPassword);
    return success(res, null, "Mot de passe mis à jour");
  }

  async updateAvatar(req, res) {
    if (!req.file) throw { status: 400, message: "Aucun fichier reçu" };

    await UserService.updateAvatar(req.params.id, req.file.filename);

    return success(res, { avatar: req.file.filename }, "Avatar mis à jour");
  }

  async delete(req, res) {
    await UserService.deleteUser(req.params.id);
    return success(res, null, "Utilisateur supprimé");
  }
}

export default new UserController();
