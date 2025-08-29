import { APIGatewayProxyEvent } from 'aws-lambda';
import Joi from 'joi';

import { AppError } from './HttpResponseErrors';

export const validationHttps = (
  event: APIGatewayProxyEvent,
  schema: {
    bodySchema?: Joi.ObjectSchema;
    querySchema?: Joi.ObjectSchema;
    pathSchema?: Joi.ObjectSchema;
  },
) => {
  let data: any;
  if (schema.bodySchema) {
    try {
      data = JSON.parse(event.body || '{}');
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }
    const { error, value } = schema.bodySchema.validate(data, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });
    if (error) {
      throw AppError.invalidInput('Validation error', error.details);
    }
    return value;
  }
  if (schema.querySchema) {
    const { error, value } = schema.querySchema.validate(event.queryStringParameters || {});
    if (error) {
      throw AppError.invalidInput('Invalid query params', error.details);
    }
    return value;
  }
  if (schema.pathSchema) {
    const { error, value } = schema.pathSchema.validate(event.pathParameters || {});
    if (error) {
      throw AppError.invalidInput('Invalid path params', error.details);
    }
    return value;
  }
  throw AppError.invalidInput('No schema provided');
};
