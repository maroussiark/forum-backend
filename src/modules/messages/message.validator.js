import Joi from "joi";

export const sendMessageSchema = Joi.object({
  conversationId: Joi.string().required(),
  content: Joi.string().min(1).max(5000).required()
});

export const messageListSchema = Joi.object({
  cursor: Joi.string().optional(),   // stable pagination
  limit: Joi.number().integer().min(1).max(50).default(20)
});
