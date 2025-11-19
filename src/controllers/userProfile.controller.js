import UserProfileService from "../services/userProfile.service.js";
import { success } from "../utils/apiResponse.js";

class UserProfileController {

  async getProfile(req, res, next) {
    try {
      const data = await UserProfileService.getProfile(req.params.userId);
      return success(res, data);
    } catch (err) { next(err); }
  }

  async updateProfile(req, res, next) {
    try {
      const data = await UserProfileService.updateProfile(req.params.userId, req.body);
      return success(res, data, "Profil mis à jour");
    } catch (err) { next(err); }
  }

  async updateAvatar(req, res, next) {
    try {
      if (!req.file) throw { status: 400, message: "Aucun fichier reçu" };

      const filename = req.file.filename;
      const url = `/uploads/avatars/${filename}`;

      const data = await UserProfileService.updateAvatar(req.params.userId, url);

      return success(res, data, "Avatar mis à jour");
    } catch (err) { next(err); }
  }

  async search(req, res, next) {
    try {
      const query = req.query.q || "";
      const data = await UserProfileService.searchUsers(query);
      return success(res, data);
    } catch (err) { next(err); }
  }
}

export default new UserProfileController();
