import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { handler } from '../../src/handlers/listProducts';
import { listProductsSchema } from '../../src/handlers/schemas/Products/listProductsSchemaHttp';
import { listProductsHttpAdapter } from '../../src/infrastructure/adapters/Products/listProductsAdaptersHttp';
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

jest.mock('../../src/infrastructure/repository/productsRepository', () => ({
  ProductRepositoryDynamoDB: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../../src/infrastructure/adapters/Products/listProductsAdaptersHttp', () => ({
  listProductsHttpAdapter: jest.fn(),
}));

describe('listProducts.handler', () => {
  const baseEvent: APIGatewayProxyEvent = {
    body: null,
    headers: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    path: '/products',
    pathParameters: null,
    queryStringParameters: { limit: '10', cursor: undefined } as any,
    requestContext: {} as any,
    resource: '/products',
    stageVariables: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('valida, ejecuta adapter y retorna 200 con logs de éxito', async () => {
    const validated = { limit: 10, cursor: undefined };
    const adapterResponse = {
      items: [
        {
          productId: 'p-1',
          name: 'Teclado',
          price: 120,
          stock: 10,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      nextCursor: undefined,
    };
    const okResponse: APIGatewayProxyResult = {
      statusCode: 200,
      headers: { 'content-type': 'application/json' } as any,
      body: JSON.stringify(adapterResponse),
    };

    (validationHttps as jest.Mock).mockResolvedValue(validated);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (listProductsHttpAdapter as jest.Mock).mockImplementation((_doCase: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return jest.fn(async (_event: APIGatewayProxyEvent, _deps: any) => adapterResponse);
    });

    (_200_OK_ as jest.Mock).mockReturnValue(okResponse);

    const res = await handler(baseEvent);

    expect(validationHttps).toHaveBeenCalledWith(baseEvent, listProductsSchema);

    expect(listProductsHttpAdapter).toHaveBeenCalledTimes(1);

    expect(_200_OK_).toHaveBeenCalledWith(adapterResponse);
    expect(res).toEqual(okResponse);

    expect(logger.info).toHaveBeenCalledWith('📥 Incoming request', { event: baseEvent });
    expect(logger.debug).toHaveBeenCalledWith('✅ Validation passed', validated);
    expect(logger.debug).toHaveBeenCalledWith('✅ List products ', adapterResponse);
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

    expect(validationHttps).toHaveBeenCalledWith(baseEvent, listProductsSchema);
    expect(listProductsHttpAdapter).not.toHaveBeenCalled();
    expect(_200_OK_).not.toHaveBeenCalled();

    expect(toHttpResponse).toHaveBeenCalledWith(thrown);
    expect(res).toEqual(mapped);

    expect(logger.info).toHaveBeenCalledWith('📥 Incoming request', { event: baseEvent });
    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('❌ Error in list products', { err: thrown });
  });
});
