import Joi from "joi";

export const createConversationSchema = Joi.object({
  members: Joi.array().items(Joi.string().uuid()).min(2).required()
});
