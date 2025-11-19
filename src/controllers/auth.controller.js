import AuthService from "../services/auth.service.js";
import { success } from "../utils/apiResponse.js";

class AuthController {

  async register(req, res, next) {
    try {
      const data = await AuthService.register(req.body);
      return success(res, data, "Inscription réussie", 201);
    } catch (err) { next(err); }
  }

  async login(req, res, next) {
    try {
      const data = await AuthService.login(req.body);
      return success(res, data, "Connexion réussie");
    } catch (err) { next(err); }
  }

  async refresh(req, res, next) {
    try {
      const token = req.body.refreshToken;
      if (!token) throw { status: 400, message: "Aucun refresh token envoyé" };

      const data = await AuthService.refreshToken(token);
      return success(res, data, "Token renouvelé");
    } catch (err) { next(err); }
  }
}

export default new AuthController();
