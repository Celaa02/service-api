import Joi from 'joi';

export const statusConfirmOrdersSchema = Joi.object({
  orderId: Joi.string().required(),
});
