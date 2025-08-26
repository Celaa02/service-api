import Joi from 'joi';

export const getByIdOrdersSchema = Joi.object({
  id: Joi.string()
    .uuid({ version: ['uuidv4', 'uuidv5'] })
    .required(),
});
