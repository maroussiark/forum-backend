import Joi from "joi";

export const reactionSchema = Joi.object({
  postId: Joi.string().optional(),
  commentId: Joi.string().optional(),
  type: Joi.string().valid("like").required()
})
.xor("postId", "commentId"); 
