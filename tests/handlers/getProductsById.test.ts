import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { handler } from '../../src/handlers/getProductsById';
import { getByIdProductsSchema } from '../../src/handlers/schemas/Products/getByIdProductsSchemaHttp';
import { getByIdProductsHttpAdapter } from '../../src/infrastructure/adapters/Products/getByIdProductsAdaptersHttp';
import { _200_OK_, _404_NOT_FOUND_ } from '../../src/utils/HttpResponse';
import { toHttpResponse } from '../../src/utils/HttpResponseErrors';
import { logger } from '../../src/utils/Logger';
import { validationHttps } from '../../src/utils/ValidationsHttps';

// Mocks
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

// Evita tocar repo real
jest.mock('../../src/infrastructure/repository/productsRepository', () => ({
  ProductRepositoryDynamoDB: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../../src/infrastructure/adapters/Products/getByIdProductsAdaptersHttp', () => ({
  getByIdProductsHttpAdapter: jest.fn(),
}));

describe('getByIdProducts.handler', () => {
  const baseEvent: APIGatewayProxyEvent = {
    body: null,
    headers: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    path: '/products/ff0dfad6-8bd6-47aa-a221-f3f844ee233b',
    pathParameters: { productId: 'ff0dfad6-8bd6-47aa-a221-f3f844ee233b' } as any,
    queryStringParameters: null,
    requestContext: {} as any,
    resource: '/products/{productId}',
    stageVariables: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('valida, ejecuta adapter, loguea y retorna 200 cuando hay producto', async () => {
    const validated = { productId: 'ff0dfad6-8bd6-47aa-a221-f3f844ee233b' };
    const adapterResponse = {
      productId: 'ff0dfad6-8bd6-47aa-a221-f3f844ee233b',
      name: 'Teclado',
      price: 120.5,
      stock: 10,
      createdAt: '2025-01-01T00:00:00.000Z',
      status: 'ACTIVE',
    };
    const okResponse: APIGatewayProxyResult = {
      statusCode: 200,
      headers: { 'content-type': 'application/json' } as any,
      body: JSON.stringify(adapterResponse),
    };

    (validationHttps as jest.Mock).mockResolvedValue(validated);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (getByIdProductsHttpAdapter as jest.Mock).mockImplementation((_doCase: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return jest.fn(async (_event: APIGatewayProxyEvent, _deps: any) => adapterResponse);
    });

    (_200_OK_ as jest.Mock).mockReturnValue(okResponse);

    const res = await handler(baseEvent);

    // Validación con el schema correcto
    expect(validationHttps).toHaveBeenCalledWith(baseEvent, getByIdProductsSchema);
    expect(getByIdProductsHttpAdapter).toHaveBeenCalledTimes(1);

    // Retorno 200
    expect(_200_OK_).toHaveBeenCalledWith(adapterResponse);
    expect(res).toEqual(okResponse);

    expect(logger.info).toHaveBeenCalledWith('📥 Incoming request', { event: baseEvent });
    expect(logger.debug).toHaveBeenCalledWith('✅ Validation passed', validated);
    expect(logger.info).toHaveBeenCalledWith('✅ Get product', adapterResponse);
    expect(logger.error).not.toHaveBeenCalled();
    expect(toHttpResponse).not.toHaveBeenCalled();
  });

  it('retorna 404 cuando el adapter devuelve null', async () => {
    const validated = { productId: 'no-exists' };
    const notFoundResponse: APIGatewayProxyResult = {
      statusCode: 404,
      headers: { 'content-type': 'application/json' } as any,
      body: JSON.stringify({
        message: 'The productsId does not exist or is not active.',
        data: [],
      }),
    };

    (validationHttps as jest.Mock).mockResolvedValue(validated);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (getByIdProductsHttpAdapter as jest.Mock).mockImplementation((_doCase: any) => {
      return jest.fn(async () => null);
    });
    (_404_NOT_FOUND_ as jest.Mock).mockReturnValue(notFoundResponse);

    const res = await handler(baseEvent);

    expect(validationHttps).toHaveBeenCalledWith(baseEvent, getByIdProductsSchema);
    expect(getByIdProductsHttpAdapter).toHaveBeenCalledTimes(1);

    expect(_404_NOT_FOUND_).toHaveBeenCalledWith({
      message: 'The productsId does not exist or is not active.',
      data: [],
    });
    expect(res).toEqual(notFoundResponse);

    expect(logger.info).toHaveBeenCalledWith('📥 Incoming request', { event: baseEvent });
    expect(logger.debug).toHaveBeenCalledWith('✅ Validation passed', validated);
    expect(logger.info).toHaveBeenCalledWith('✅ Get product', null);
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

    expect(validationHttps).toHaveBeenCalledWith(baseEvent, getByIdProductsSchema);
    expect(getByIdProductsHttpAdapter).not.toHaveBeenCalled();
    expect(_200_OK_).not.toHaveBeenCalled();
    expect(_404_NOT_FOUND_).not.toHaveBeenCalled();

    expect(toHttpResponse).toHaveBeenCalledWith(thrown);
    expect(res).toEqual(mapped);

    // Debió loguear el incoming request y el error
    expect(logger.info).toHaveBeenCalledWith('📥 Incoming request', { event: baseEvent });
    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('❌ Error in get products', { err: thrown });
  });
});
