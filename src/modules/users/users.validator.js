import Joi from "joi";

export const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  fullName: Joi.string().min(2).optional(),
}).min(1);

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).optional(),
  bio: Joi.string().max(500).optional(),
  avatarUrl: Joi.string().uri().optional(),
  phone: Joi.string().optional(),
  socialLinks: Joi.object().optional()
}).min(1);
