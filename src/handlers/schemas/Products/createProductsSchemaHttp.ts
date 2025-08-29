import Joi from 'joi';

export const bodySchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().positive().precision(2).required(),
  stock: Joi.number().required(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').required(),
});
