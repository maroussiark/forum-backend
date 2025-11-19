import rateLimit from "express-rate-limit";

export const limitAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Trop de tentatives. Réessayez plus tard." }
});

export const limitPublic = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100
});
