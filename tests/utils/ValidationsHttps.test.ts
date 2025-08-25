import { APIGatewayProxyEvent } from 'aws-lambda';
import Joi from 'joi';

import { validationHttps } from '../../src/utils/ValidationsHttps';

const makeEvent = (overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent =>
  ({
    body: null,
    headers: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    path: '/any',
    pathParameters: null,
    queryStringParameters: null,
    requestContext: {} as any,
    resource: '/any',
    stageVariables: null,
    ...overrides,
  }) as unknown as APIGatewayProxyEvent;

describe('validationHttps', () => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    items: Joi.array()
      .items(
        Joi.object({
          sku: Joi.string().required(),
          qty: Joi.number().integer().min(1).required(),
        }),
      )
      .min(1)
      .required(),
  });

  it('devuelve value validado desde body JSON (stripUnknown debe limpiar)', async () => {
    const payload = {
      userId: 'u-1',
      items: [{ sku: 'A1', qty: 2 }],
      extra: 'should be stripped',
    };
    const event = makeEvent({ body: JSON.stringify(payload) });

    const value = await validationHttps(event, schema);

    expect(value).toEqual({
      userId: 'u-1',
      items: [{ sku: 'A1', qty: 2 }],
    });
    expect((value as any).extra).toBeUndefined();
  });

  it('lanza AppError.badRequest si el body es JSON inválido', async () => {
    const event = makeEvent({ body: '{ invalid: json }' });

    await expect(validationHttps(event, schema)).rejects.toMatchObject({
      name: 'AppError',
      statusCode: 400,
      code: 'BAD_REQUEST',
      message: 'Invalid JSON body',
    });
  });

  it('usa pathParameters cuando no hay body', async () => {
    const event = makeEvent({
      pathParameters: { userId: 'u-2' } as any, // faltan items -> debe fallar
    });

    await expect(validationHttps(event, schema)).rejects.toMatchObject({
      name: 'AppError',
      statusCode: 402,
      code: 'INVALID_INPUT',
      message: 'Validation error',
    });
  });

  it('usa queryStringParameters cuando no hay body ni pathParameters', async () => {
    const event = makeEvent({
      queryStringParameters: {
        userId: 'u-3',
      } as any,
    });

    await expect(validationHttps(event, schema)).rejects.toMatchObject({
      name: 'AppError',
      statusCode: 402,
      code: 'INVALID_INPUT',
      message: 'Validation error',
    });
  });

  it('lanza AppError.invalidInput si no hay body, path ni query', async () => {
    const event = makeEvent();

    await expect(validationHttps(event, schema)).rejects.toMatchObject({
      name: 'AppError',
      statusCode: 402,
      code: 'INVALID_INPUT',
      message: 'Invalid input',
    });
  });

  it('pasa con pathParameters válidos si coinciden con el schema', async () => {
    const event = makeEvent({
      pathParameters: {
        userId: 'u-4',
      } as any,
    });

    await expect(validationHttps(event, schema)).rejects.toMatchObject({
      statusCode: 402,
      code: 'INVALID_INPUT',
    });
  });

  it('devuelve error de validación con detalles cuando el body no cumple el schema', async () => {
    const payload = {
      userId: 'u-1',
      items: [{ sku: 'A1', qty: 0 }],
    };
    const event = makeEvent({ body: JSON.stringify(payload) });

    await expect(validationHttps(event, schema)).rejects.toMatchObject({
      name: 'AppError',
      statusCode: 402,
      code: 'INVALID_INPUT',
      message: 'Validation error',
    });
  });

  it('acepta y valida correctamente cuando el body cumple el schema', async () => {
    const payload = {
      userId: 'ok-1',
      items: [{ sku: 'B2', qty: 3 }],
    };
    const event = makeEvent({ body: JSON.stringify(payload) });

    const value = await validationHttps(event, schema);
    expect(value).toEqual(payload);
  });
});
