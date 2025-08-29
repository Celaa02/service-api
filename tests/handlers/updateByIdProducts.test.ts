import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { pathSchema } from '../../src/handlers/schemas/Products/updateByIdProductsSchemaHttp';
import { handler } from '../../src/handlers/updateByIdProducts';
import { updateByIdProductsHttpAdapter } from '../../src/infrastructure/adapters/Products/updateByIdProductsAdaptersHttp';
import { _200_OK_, _404_NOT_FOUND_ } from '../../src/utils/HttpResponse';
import { toHttpResponse } from '../../src/utils/HttpResponseErrors';
import { logger } from '../../src/utils/Logger';
import { validationHttps } from '../../src/utils/ValidationsHttps';

jest.mock('../../src/utils/ValidationsHttps', () => ({
  validationHttps: jest.fn(),
}));

jest.mock('../../src/utils/HttpResponse', () => ({
  _200_OK_: jest.fn(),
  _404_NOT_FOUND_: jest.fn(),
}));

jest.mock('../../src/utils/HttpResponseErrors', () => ({
  toHttpResponse: jest.fn(),
}));

jest.mock('../../src/utils/Logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../src/infrastructure/adapters/Products/updateByIdProductsAdaptersHttp', () => ({
  updateByIdProductsHttpAdapter: jest.fn(),
}));

describe('updateByIdProducts.handler', () => {
  const baseEvent: APIGatewayProxyEvent = {
    body: null,
    headers: {},
    httpMethod: 'PATCH',
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    path: '/products/123',
    pathParameters: { productId: 'prod-123' },
    queryStringParameters: null,
    requestContext: {} as any,
    resource: '/products/{productId}',
    stageVariables: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('valida, ejecuta adapter, loguea y retorna 200 cuando hay respuesta', async () => {
    const validatedPath = { productId: 'prod-123' };
    (validationHttps as jest.Mock).mockResolvedValue(validatedPath);

    const adapterFn = jest.fn().mockResolvedValue({
      productId: 'prod-123',
      name: 'Nuevo nombre',
      price: 120,
      stock: 5,
      status: 'ACTIVE',
      createdAt: '2025-01-01T00:00:00.000Z',
    });
    (updateByIdProductsHttpAdapter as jest.Mock).mockReturnValue(adapterFn);

    const okResponse: APIGatewayProxyResult = {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
    (_200_OK_ as jest.Mock).mockReturnValue(okResponse);

    const res = await handler(baseEvent);

    expect(validationHttps).toHaveBeenCalledWith(baseEvent, { pathSchema });
    expect(updateByIdProductsHttpAdapter).toHaveBeenCalledTimes(1);
    expect(adapterFn).toHaveBeenCalledWith(baseEvent, expect.any(Object)); // dependencies

    // logs
    expect(logger.info).toHaveBeenCalledWith('📥 Incoming request', { event: baseEvent });
    expect(logger.debug).toHaveBeenCalledWith('✅ Validation passed', validatedPath);
    expect(logger.info).toHaveBeenCalledWith(
      '✅ Update product id',
      expect.objectContaining({ productId: 'prod-123' }),
    );

    expect(_200_OK_).toHaveBeenCalledWith(expect.objectContaining({ productId: 'prod-123' }));
    expect(res).toBe(okResponse);

    // no error path
    expect(logger.error).not.toHaveBeenCalled();
    expect(toHttpResponse).not.toHaveBeenCalled();
  });

  it('retorna 404 cuando el adapter devuelve null', async () => {
    (validationHttps as jest.Mock).mockResolvedValue({ productId: 'prod-404' });

    const adapterFn = jest.fn().mockResolvedValue(null);
    (updateByIdProductsHttpAdapter as jest.Mock).mockReturnValue(adapterFn);

    const notFound: APIGatewayProxyResult = {
      statusCode: 404,
      body: JSON.stringify({ message: 'Product not in CREATED.', data: [] }),
      headers: { 'content-type': 'application/json' },
    };
    (_404_NOT_FOUND_ as jest.Mock).mockReturnValue(notFound);

    const res = await handler(baseEvent);

    expect(validationHttps).toHaveBeenCalledWith(baseEvent, { pathSchema });
    expect(adapterFn).toHaveBeenCalled();

    expect(_404_NOT_FOUND_).toHaveBeenCalledWith({
      message: 'Product not in CREATED.',
      data: [],
    });
    expect(res).toBe(notFound);

    expect(_200_OK_).not.toHaveBeenCalled();
    expect(toHttpResponse).not.toHaveBeenCalled();
  });

  it('mapea error con toHttpResponse y lo loguea', async () => {
    const thrown = new Error('boom');
    (validationHttps as jest.Mock).mockRejectedValue(thrown);

    const mapped: APIGatewayProxyResult = {
      statusCode: 500,
      body: JSON.stringify({ code: 'X', message: 'mapped' }),
      headers: { 'content-type': 'application/json' },
    };
    (toHttpResponse as jest.Mock).mockReturnValue(mapped);

    const res = await handler(baseEvent);

    expect(validationHttps).toHaveBeenCalledWith(baseEvent, { pathSchema });
    expect(logger.error).toHaveBeenCalledWith('❌ Error in update product id', { err: thrown });

    expect(toHttpResponse).toHaveBeenCalledWith(thrown);
    expect(res).toBe(mapped);

    // no success path
    expect(_200_OK_).not.toHaveBeenCalled();
    expect(_404_NOT_FOUND_).not.toHaveBeenCalled();
  });
});
