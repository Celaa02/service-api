import Joi from 'joi';

export const getByIdProductsSchema = Joi.object({
  productId: Joi.string()
    .uuid({ version: ['uuidv4', 'uuidv5'] })
    .required(),
});
