import UserProfileService from "../services/userProfile.service.js";
import { success } from "../utils/apiResponse.js";

class UserProfileController {

  async getProfile(req, res) {
      const data = await UserProfileService.getProfile(req.params.userId);
      return success(res, data);
  }

  async updateProfile(req, res) {
      const data = await UserProfileService.updateProfile(req.params.userId, req.body);
      return success(res, data, "Profil mis à jour");
  }

  async updateAvatar(req, res) {
      if (!req.file) throw { status: 400, message: "Aucun fichier reçu" };

      const filename = req.file.filename;
      const url = `/uploads/avatars/${filename}`;

      const data = await UserProfileService.updateAvatar(req.params.userId, url);

      return success(res, data, "Avatar mis à jour");
  }

  async search(req, res) {
      const query = req.query.q || "";
      const data = await UserProfileService.searchUsers(query);
      return success(res, data);
  }
}

export default new UserProfileController();
