import AdminService from "./admin.service.js";
import { success } from "../../utils/apiResponse.js";

class AdminController {
  async stats(req, res) {
    return success(res, await AdminService.stats(), "Stats admin");
  }
  async me(req, res) {
    // return a detailed current user payload for admin frontend checks
    const data = await AdminService.getCurrentUser(req.user.id);
    return success(res, data, "Utilisateur courant");
  }
  async roles(req, res) {
    return success(res, await AdminService.roles(), "Rôles");
  }
  async listUsers(req, res) {
    return success(res, await AdminService.listUsers(req.query), "Utilisateurs");
  }
  async setUserRole(req, res) {
    return success(res, await AdminService.setUserRole(req.params.userId, req.body.roleId), "Rôle modifié");
  }
  async setUserBlocked(req, res) {
    return success(res, await AdminService.setUserBlocked(req.params.userId, req.body.blocked), "Blocage modifié");
  }
  async deleteUser(req, res) {
    await AdminService.softDeleteUser(req.params.userId);
    return success(res, null, "Utilisateur supprimé");
  }
  async listPosts(req, res) {
    return success(res, await AdminService.listPosts(req.query), "Posts");
  }
  async setPostVisibility(req, res) {
    return success(res, await AdminService.setPostVisibility(req.params.postId, req.body.deleted), "Post modifié");
  }
  async listComments(req, res) {
    return success(res, await AdminService.listComments(req.query), "Commentaires");
  }
  async setCommentVisibility(req, res) {
    return success(res, await AdminService.setCommentVisibility(req.params.commentId, req.body.deleted), "Commentaire modifié");
  }
}

export default new AdminController();
