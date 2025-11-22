import crypto from "crypto";

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateRandomToken() {
  return crypto.randomBytes(40).toString("hex");
}
