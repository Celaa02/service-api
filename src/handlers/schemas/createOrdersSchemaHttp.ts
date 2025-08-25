import Joi from 'joi';

export const createOrdersSchema = Joi.object({
  userId: Joi.string().required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        qty: Joi.number().integer().positive().required(),
      }),
    )
    .min(1)
    .required(),
});
