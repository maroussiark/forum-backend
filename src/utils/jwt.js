import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRES = process.env.JWT_EXPIRES || "1h";

const REFRESH_SECRET = process.env.REFRESH_SECRET;
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES || "7d";

export function signAccessToken(payload = {}) {
  if (!ACCESS_SECRET) throw new Error("JWT_SECRET non défini dans .env");
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export function signRefreshToken(payload = {}) {
  if (!REFRESH_SECRET) throw new Error("REFRESH_SECRET non défini dans .env");
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

export function verifyToken(token) {
  if (!ACCESS_SECRET) throw new Error("JWT_SECRET non défini dans .env");
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (err) {
    console.log(err);
    const e = new Error("Token invalide ou expiré");
    e.status = 401;
    throw e;
  }
}

export function verifyRefreshToken(token) {
  if (!REFRESH_SECRET) throw new Error("REFRESH_SECRET non défini dans .env");
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    const e = new Error("Refresh token invalide ou expiré");
    e.status = 401;
    throw e;
  }
}

export function socketAuthFromHandshake(handshake) {
  const token =
    handshake?.auth?.token ||
    handshake?.query?.token;

  if (!token) {
    const e = new Error("Token manquant pour WebSocket");
    e.status = 401;
    throw e;
  }

  return verifyToken(token);
}

export default {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  verifyRefreshToken,
  socketAuthFromHandshake,
};
