import { APIGatewayProxyEvent } from 'aws-lambda';
import Joi from 'joi';

import { AppError } from './HttpResponseErrors';

export const validationHttps = async (event: APIGatewayProxyEvent, schema: Joi.ObjectSchema) => {
  const { body, pathParameters, queryStringParameters } = event ?? {};

  let data: any;

  if (typeof body === 'string' && body.trim() !== '') {
    try {
      data = JSON.parse(body);
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }
  } else if (pathParameters && Object.keys(pathParameters).length > 0) {
    data = pathParameters;
  } else if (queryStringParameters && Object.keys(queryStringParameters).length > 0) {
    data = queryStringParameters;
  } else {
    throw AppError.invalidInput('Invalid input');
  }

  const { value, error } = schema.validate(data, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });

  if (error) {
    throw AppError.invalidInput('Validation error', error.details);
  }

  return value;
};
