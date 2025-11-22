import ProfileService from "./profile.service.js";
import { success } from "../../utils/apiResponse.js";

class ProfileController {

  async getProfile(req, res) {
    const profile = await ProfileService.getProfile(req.params.userId);
    return success(res, profile);
  }

  async updateProfile(req, res) {
    const updated = await ProfileService.updateProfile(
      req.params.userId,
      req.user.id,
      req.user.isModerator,
      req.body,
      req.file,
      req.io
    );

    return success(res, updated, "Profil mis à jour");
  }
}

export default new ProfileController();
