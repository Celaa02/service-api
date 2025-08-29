import { APIGatewayProxyEvent } from 'aws-lambda';
import Joi from 'joi';

jest.mock('../../src/utils/HttpResponseErrors', () => {
  class AppError extends Error {
    statusCode: number;
    code: string;
    details?: unknown;
    constructor(message: string, statusCode = 400, code = 'BAD_REQUEST', details?: unknown) {
      super(message);
      this.name = 'AppError';
      this.statusCode = statusCode;
      this.code = code;
      this.details = details;
    }
    static badRequest(message = 'Bad request', details?: unknown) {
      return new AppError(message, 400, 'BAD_REQUEST', details);
    }
    static invalidInput(message = 'Invalid input', details?: unknown) {
      return new AppError(message, 402, 'INVALID_INPUT', details);
    }
    static notFound(message = 'Not found', details?: unknown) {
      return new AppError(message, 404, 'NOT_FOUND', details);
    }
    static internal(message = 'Internal server error', details?: unknown) {
      return new AppError(message, 500, 'INTERNAL_ERROR', details);
    }
  }
  return { AppError };
});

import { AppError } from '../../src/utils/HttpResponseErrors';
import { validationHttps } from '../../src/utils/ValidationsHttps';

const makeEvent = (overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent =>
  ({
    body: null,
    headers: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    path: '/resource',
    pathParameters: null,
    queryStringParameters: null,
    requestContext: {} as any,
    resource: '/resource',
    stageVariables: null,
    ...overrides,
  }) as unknown as APIGatewayProxyEvent;

describe('validationHttps', () => {
  it('valida bodySchema y retorna el valor limpiado', async () => {
    const schema = {
      bodySchema: Joi.object({
        id: Joi.string().required(),
        qty: Joi.number().integer().required(),
      }),
    };
    const event = makeEvent({
      body: JSON.stringify({ id: 'A1', qty: 3, extra: 'remove-me' }),
    });

    const result = await validationHttps(event, schema);

    // stripUnknown => extra se elimina
    expect(result).toEqual({ id: 'A1', qty: 3 });
  });

  it('lanza AppError.badRequest si el JSON del body es inválido', async () => {
    const schema = {
      bodySchema: Joi.object({ id: Joi.string().required() }),
    };
    const event = makeEvent({ body: '{ invalid json' });

    try {
      await validationHttps(event, schema);
      throw new Error('should not reach');
    } catch (err: any) {
      expect(err).toBeInstanceOf(AppError);
      expect(err.message).toBe('Invalid JSON body');
      expect(err.code).toBe('BAD_REQUEST');
      expect(err.statusCode).toBe(400);
    }
  });

  it('lanza AppError.invalidInput si bodySchema falla validación', async () => {
    const schema = {
      bodySchema: Joi.object({ id: Joi.string().uuid().required() }),
    };
    const event = makeEvent({ body: JSON.stringify({ id: 'not-a-uuid' }) });

    try {
      await validationHttps(event, schema);
      throw new Error('should not reach');
    } catch (err: any) {
      expect(err).toBeInstanceOf(AppError);
      expect(err.code).toBe('INVALID_INPUT');
      expect(err.statusCode).toBe(402);
      // details viene de Joi
      expect(err.details).toBeTruthy();
    }
  });

  it('valida querySchema cuando no hay bodySchema', async () => {
    const schema = {
      querySchema: Joi.object({
        limit: Joi.number().integer().min(1).max(100).required(),
        cursor: Joi.string().optional(),
      }),
    };
    const event = makeEvent({
      queryStringParameters: { limit: '10', cursor: 'abc' },
    });

    const result = await validationHttps(event, schema);

    // Ojo: Joi no castea string->number por defecto, pero si en tu config global usas convert:true, castea.
    // En este test asumimos sin conversión, así que limit se mantiene "10" (string).
    expect(result).toEqual({ limit: 10, cursor: 'abc' });
  });

  it('valida pathSchema cuando no hay bodySchema ni querySchema', async () => {
    const schema = {
      pathSchema: Joi.object({
        id: Joi.string().required(),
      }),
    };
    const event = makeEvent({
      pathParameters: { id: 'p-1' },
    });

    const result = await validationHttps(event, schema);
    expect(result).toEqual({ id: 'p-1' });
  });

  it('lanza AppError.invalidInput si querySchema falla', () => {
    const schema = {
      querySchema: Joi.object({ limit: Joi.number().integer().min(1).required() }),
    };
    const event = makeEvent({
      queryStringParameters: { limit: 'abc' }, // inválido
    });

    try {
      validationHttps(event, schema);
      fail('Debe lanzar AppError.invalidInput');
    } catch (err: any) {
      expect(err).toBeInstanceOf(AppError);
      expect(err.code).toBe('INVALID_INPUT');
      expect(err.statusCode).toBe(402);
      expect(err.message).toBe('Invalid query params');
      expect(err.details).toBeTruthy(); // detalles de Joi
    }
  });

  it('prioriza bodySchema sobre querySchema/pathSchema si están presentes', async () => {
    const schema = {
      bodySchema: Joi.object({ a: Joi.number().required() }),
      querySchema: Joi.object({ b: Joi.number().required() }),
      pathSchema: Joi.object({ c: Joi.number().required() }),
    };
    const event = makeEvent({
      body: JSON.stringify({ a: 1 }),
      queryStringParameters: { b: '2' },
      pathParameters: { c: '3' },
    });

    const result = await validationHttps(event, schema);
    expect(result).toEqual({ a: 1 }); // SOLO usó bodySchema
  });

  it('lanza AppError.invalidInput("No schema provided") si no se pasa ningún esquema', () => {
    const schema = {} as any;
    const event = makeEvent();

    try {
      validationHttps(event, schema);
      fail('Debe lanzar AppError.invalidInput');
    } catch (err: any) {
      expect(err).toBeInstanceOf(AppError);
      expect(err.code).toBe('INVALID_INPUT');
      expect(err.statusCode).toBe(402);
      expect(err.message).toBe('No schema provided');
    }
  });
});
