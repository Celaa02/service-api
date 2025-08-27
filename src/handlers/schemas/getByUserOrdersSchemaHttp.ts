import Joi from 'joi';

export const getByUserOrdersSchema = Joi.object({
  userId: Joi.string().required(),
  limit: Joi.number(),
});
