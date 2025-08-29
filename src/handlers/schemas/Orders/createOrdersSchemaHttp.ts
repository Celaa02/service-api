import Joi from 'joi';

export const bodySchema = Joi.object({
  userId: Joi.string().required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        qty: Joi.number().integer().positive().required(),
        price: Joi.number().positive().precision(2).required(),
      }),
    )
    .min(1)
    .required(),
  status: Joi.string().required(),
  total: Joi.number().positive().precision(2).required(),
});
