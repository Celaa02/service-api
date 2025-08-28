import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { handler } from '../../src/handlers/createProducts';
import { createProductsSchema } from '../../src/handlers/schemas/Products/createProductsSchemaHttp';
import { createProductsHttpAdapter } from '../../src/infrastructure/adapters/Products/createProductsAdaptersHttp';
import { _201_CREATED_ } from '../../src/utils/HttpResponse';
import { toHttpResponse } from '../../src/utils/HttpResponseErrors';
import { logger } from '../../src/utils/Logger';
import { validationHttps } from '../../src/utils/ValidationsHttps';

jest.mock('../../src/utils/ValidationsHttps', () => ({
  validationHttps: jest.fn(),
}));

jest.mock('../../src/utils/HttpResponse', () => ({
  _201_CREATED_: jest.fn(),
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

jest.mock('../../src/infrastructure/repository/productsRepository', () => ({
  ProductRepositoryDynamoDB: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../../src/infrastructure/adapters/Products/createProductsAdaptersHttp', () => ({
  createProductsHttpAdapter: jest.fn(),
}));

describe('createProducts.handler', () => {
  const baseEvent: APIGatewayProxyEvent = {
    body: JSON.stringify({ productId: 'p-1', name: 'Teclado', price: 120, stock: 10 }),
    headers: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    path: '/products',
    pathParameters: null,
    queryStringParameters: null,
    requestContext: {} as any,
    resource: '/products',
    stageVariables: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('valida, ejecuta adapter y retorna 201 con logs de éxito', async () => {
    const validated = { productId: 'p-1', name: 'Teclado', price: 120, stock: 10 };
    const adapterResponse = {
      productId: 'p-1',
      name: 'Teclado',
      price: 120,
      stock: 10,
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    const okResponse: APIGatewayProxyResult = {
      statusCode: 201,
      headers: { 'content-type': 'application/json' } as any,
      body: JSON.stringify(adapterResponse),
    };

    (validationHttps as jest.Mock).mockResolvedValue(validated);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (createProductsHttpAdapter as jest.Mock).mockImplementation((_doCase: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return jest.fn(async (_event: APIGatewayProxyEvent, _deps: any) => adapterResponse);
    });

    (_201_CREATED_ as jest.Mock).mockReturnValue(okResponse);

    const res = await handler(baseEvent);

    expect(validationHttps).toHaveBeenCalledWith(baseEvent, createProductsSchema);

    expect(createProductsHttpAdapter).toHaveBeenCalledTimes(1);

    expect(_201_CREATED_).toHaveBeenCalledWith(adapterResponse);
    expect(res).toEqual(okResponse);

    expect(logger.info).toHaveBeenCalledWith('📥 Incoming request', { event: baseEvent });
    expect(logger.debug).toHaveBeenCalledWith('✅ Validation passed', validated);
    expect(logger.debug).toHaveBeenCalledWith('✅ Products created ', adapterResponse);
    expect(logger.error).not.toHaveBeenCalled();
    expect(toHttpResponse).not.toHaveBeenCalled();
  });

  it('mapea errores con toHttpResponse y loguea error', async () => {
    const thrown = new Error('validation failed');
    const mapped: APIGatewayProxyResult = {
      statusCode: 400,
      headers: { 'content-type': 'application/json' } as any,
      body: JSON.stringify({ code: 'BAD_REQUEST', message: 'bad' }),
    };

    (validationHttps as jest.Mock).mockRejectedValue(thrown);
    (toHttpResponse as jest.Mock).mockReturnValue(mapped);

    const res = await handler(baseEvent);

    expect(validationHttps).toHaveBeenCalledWith(baseEvent, createProductsSchema);
    expect(createProductsHttpAdapter).not.toHaveBeenCalled();
    expect(_201_CREATED_).not.toHaveBeenCalled();

    expect(toHttpResponse).toHaveBeenCalledWith(thrown);
    expect(res).toEqual(mapped);

    // Logs
    expect(logger.info).toHaveBeenCalledWith('📥 Incoming request', { event: baseEvent });
    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('❌ Error in products create', { err: thrown });
  });
});
