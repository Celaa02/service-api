import Joi from 'joi';

export const listProductsSchema = Joi.object({
  limit: Joi.number().required(),
  cursor: Joi.string(),
});
