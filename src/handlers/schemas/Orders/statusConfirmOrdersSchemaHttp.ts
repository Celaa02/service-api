import Joi from 'joi';

export const pathSchema = Joi.object({
  orderId: Joi.string().required(),
});
