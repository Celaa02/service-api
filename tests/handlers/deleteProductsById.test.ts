import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { handler } from '../../src/handlers/deleteProductsById';
import { pathSchema } from '../../src/handlers/schemas/Products/deleteByIdProductsSchemaHttp';
import { deleteByIdProductsHttpAdapter } from '../../src/infrastructure/adapters/Products/deleteByIdProductsAdaptersHttp';
import { _200_OK_ } from '../../src/utils/HttpResponse';
import { toHttpResponse } from '../../src/utils/HttpResponseErrors';
import { logger } from '../../src/utils/Logger';
import { validationHttps } from '../../src/utils/ValidationsHttps';

jest.mock('../../src/utils/ValidationsHttps', () => ({
  validationHttps: jest.fn(),
}));

jest.mock('../../src/utils/HttpResponse', () => ({
  _200_OK_: jest.fn(),
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

jest.mock('../../src/infrastructure/adapters/Products/deleteByIdProductsAdaptersHttp', () => ({
  deleteByIdProductsHttpAdapter: jest.fn(),
}));

describe('deleteByIdProducts.handler', () => {
  const baseEvent: APIGatewayProxyEvent = {
    body: null,
    headers: {},
    httpMethod: 'DELETE',
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    path: '/products/prod-123',
    pathParameters: { productId: 'prod-123' },
    queryStringParameters: null,
    requestContext: {} as any,
    resource: '/products/{productId}',
    stageVariables: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('valida, ejecuta adapter, loguea y retorna 200 con _200_OK_', async () => {
    const validatedPath = { productId: 'prod-123' };
    (validationHttps as jest.Mock).mockResolvedValue(validatedPath);

    const adapterFn = jest.fn().mockResolvedValue({
      productId: 'prod-123',
      deleted: true,
    });
    (deleteByIdProductsHttpAdapter as jest.Mock).mockReturnValue(adapterFn);

    const ok: APIGatewayProxyResult = {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
    (_200_OK_ as jest.Mock).mockReturnValue(ok);

    const res = await handler(baseEvent);

    expect(validationHttps).toHaveBeenCalledWith(baseEvent, { pathSchema });

    expect(deleteByIdProductsHttpAdapter).toHaveBeenCalledTimes(1);
    expect(adapterFn).toHaveBeenCalledWith(baseEvent, expect.any(Object)); // dependencies

    expect(logger.info).toHaveBeenCalledWith('📥 Incoming request', { event: baseEvent });
    expect(logger.debug).toHaveBeenCalledWith('✅ Validation passed', validatedPath);
    expect(logger.info).toHaveBeenCalledWith(
      '✅ Delete product',
      expect.objectContaining({ productId: 'prod-123', deleted: true }),
    );

    expect(_200_OK_).toHaveBeenCalledWith(
      expect.objectContaining({ productId: 'prod-123', deleted: true }),
    );
    expect(res).toBe(ok);

    expect(logger.error).not.toHaveBeenCalled();
    expect(toHttpResponse).not.toHaveBeenCalled();
  });

  it('mapea el error con toHttpResponse cuando validationHttps falla', async () => {
    const thrown = new Error('invalid path');
    (validationHttps as jest.Mock).mockRejectedValue(thrown);

    const mapped: APIGatewayProxyResult = {
      statusCode: 400,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: 'INVALID_INPUT', message: 'bad path' }),
    };
    (toHttpResponse as jest.Mock).mockReturnValue(mapped);

    const res = await handler(baseEvent);

    expect(validationHttps).toHaveBeenCalledWith(baseEvent, { pathSchema });
    expect(deleteByIdProductsHttpAdapter).not.toHaveBeenCalled();

    expect(logger.error).toHaveBeenCalledWith('❌ Error in get products', { err: thrown });
    expect(toHttpResponse).toHaveBeenCalledWith(thrown);

    expect(res).toBe(mapped);
    expect(_200_OK_).not.toHaveBeenCalled();
  });
});
