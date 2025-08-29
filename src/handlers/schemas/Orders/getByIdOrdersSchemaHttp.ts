import Joi from 'joi';

export const pathSchema = Joi.object({
  id: Joi.string()
    .uuid({ version: ['uuidv4', 'uuidv5'] })
    .required(),
});
