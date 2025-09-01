import { APIGatewayProxyEvent } from 'aws-lambda';
import Joi from 'joi';

import { AppError } from './HttpResponseErrors';

/**
 * Valida la entrada de un evento de API Gateway contra esquemas Joi.
 *
 * Soporta tres tipos de validación:
 * - `bodySchema`: valida y normaliza el cuerpo de la petición (JSON).
 * - `querySchema`: valida los parámetros de query.
 * - `pathSchema`: valida los parámetros de path.
 *
 * Reglas de validación:
 * - `abortEarly: false`: acumula todos los errores en lugar de detenerse en el primero.
 * - `allowUnknown: false`: no permite campos no definidos en el esquema.
 * - `stripUnknown: true`: elimina campos extra no definidos en el esquema.
 *
 * @param event - Evento de API Gateway con body, query y/o path.
 * @param schema - Objeto con los esquemas Joi opcionales: bodySchema, querySchema, pathSchema.
 *
 * @returns Los valores validados y transformados según el esquema.
 *
 * @throws AppError.badRequest - Si el body no es JSON válido.
 * @throws AppError.invalidInput - Si la validación falla o no se proporciona ningún esquema.
 */
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
