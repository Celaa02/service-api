import Joi from 'joi';

export const pathSchema = Joi.object({
  userId: Joi.string().required(),
});
export const querySchema = Joi.object({
  limit: Joi.number(),
});
