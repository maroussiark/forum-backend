import AuthService from "./auth.service.js";
import { success } from "../utils/apiResponse.js";
import { badRequest } from "../shared/errors/ApiError.js";

class AuthController {

  async register(req, res) {
    const data = await AuthService.register(req.body);
    return success(res, data, "Inscription réussie", 201);
  }

  async login(req, res) {
    const data = await AuthService.login(req.body);
    return success(res, data, "Connexion réussie");
  }

  async refresh(req, res) {
    const token = req.body.refreshToken;
    if (!token) throw badRequest("Aucun refresh token envoyé", "NO_REFRESH_TOKEN");

    const data = await AuthService.refreshToken(token);
    return success(res, data, "Token renouvelé");
  }
}

export default new AuthController();
