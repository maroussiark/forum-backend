import AdminService from "./admin.service.js";
import { success } from "../../utils/apiResponse.js";

class AdminController {
  async stats(req, res) {
    const data = await AdminService.stats();
    return success(res, data);
  }

  async listUsers(req, res) {
    const data = await AdminService.listUsers(req.query);
    return success(res, data);
  }

  async setUserRole(req, res) {
    const data = await AdminService.setUserRole(req.params.userId, req.body);
    return success(res, data, "Rôle modifié");
  }

  async setUserBlock(req, res) {
    const data = await AdminService.setUserBlock(req.params.userId, req.body);
    return success(res, data, "Statut de blocage modifié");
  }

  async deleteUser(req, res) {
    await AdminService.softDeleteUser(req.params.userId);
    return success(res, null, "Utilisateur supprimé");
  }

  async listPosts(req, res) {
    const data = await AdminService.listPosts(req.query);
    return success(res, data);
  }

  async setPostVisibility(req, res) {
    const data = await AdminService.setPostVisibility(req.params.postId, req.body);
    return success(res, data, "Visibilité du post modifiée");
  }

  async listComments(req, res) {
    const data = await AdminService.listComments(req.query);
    return success(res, data);
  }

  async setCommentVisibility(req, res) {
    const data = await AdminService.setCommentVisibility(req.params.commentId, req.body);
    return success(res, data, "Visibilité du commentaire modifiée");
  }
}

export default new AdminController();
