import Joi from "joi";

export const createPostSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  content: Joi.string().allow("").max(10000).default(""),
  categoryId: Joi.string().optional(),
});

export const updatePostSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  content: Joi.string().allow("").max(10000).optional(),
  categoryId: Joi.string().optional(),
}).min(1);

export const listPostsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  categoryId: Joi.string().optional(),
});
