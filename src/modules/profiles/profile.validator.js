import Joi from "joi";

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).optional(),
  bio: Joi.string().max(500).optional(),
  phone: Joi.string().optional(),
  socialLinks: Joi.object().optional(),
}).min(1);
