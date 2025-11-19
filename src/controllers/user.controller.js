import UserService from "../services/user.service.js";
import { success } from "../utils/apiResponse.js";

class UserController {
  async updateProfile(req, res, next) {
    try {
      const user = await UserService.updateProfile(
        Number(req.params.id),
        req.body,
      );
      return success(res, user, "Profil mis à jour");
    } catch (err) {
      next(err);
    }
  }

  async updatePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      await UserService.updatePassword(
        Number(req.params.id),
        oldPassword,
        newPassword,
      );
      return success(res, null, "Mot de passe mis à jour");
    } catch (err) {
      next(err);
    }
  }

  async updateAvatar(req, res, next) {
    try {
      if (!req.file) throw { status: 400, message: "Aucun fichier reçu" };

      await UserService.updateAvatar(req.params.id, req.file.filename);

      return success(res, { avatar: req.file.filename }, "Avatar mis à jour");
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await UserService.deleteUser(Number(req.params.id));
      return success(res, null, "Utilisateur supprimé");
    } catch (err) {
      next(err);
    }
  }
}

export default new UserController();
