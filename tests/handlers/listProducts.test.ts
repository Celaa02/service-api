import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { handler } from '../../src/handlers/listProducts';
import { listProductsHttpAdapter } from '../../src/infrastructure/adapters/Products/listProductsAdaptersHttp';
import { _200_OK_ } from '../../src/utils/HttpResponse';
import { toHttpResponse } from '../../src/utils/HttpResponseErrors';
import { logger } from '../../src/utils/Logger';

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

describe('handlers/listProducts.handler', () => {
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

  it('construye el adapter, ejecuta, loguea y retorna 200 con la lista', async () => {
    const adapterResponse = {
      items: [
        {
          productId: 'p1',
          name: 'Mouse',
          price: 35,
          status: 'ACTIVE',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          productId: 'p2',
          name: 'Teclado',
          price: 120,
          status: 'ACTIVE',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ],
      nextCursor: 'abc',
    };
    const okResponse: APIGatewayProxyResult = {
      statusCode: 200,
      headers: { 'content-type': 'application/json' } as any,
      body: JSON.stringify(adapterResponse),
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (listProductsHttpAdapter as jest.Mock).mockImplementation((_doCase: any) => {
      return jest.fn(async () => adapterResponse);
    });
    (_200_OK_ as jest.Mock).mockReturnValue(okResponse);

    const res = await handler(baseEvent);

    expect(listProductsHttpAdapter).toHaveBeenCalledTimes(1);

    expect(_200_OK_).toHaveBeenCalledWith(adapterResponse);
    expect(res).toEqual(okResponse);

    const infoCalls = (logger.info as jest.Mock).mock.calls;
    const hasIncoming = infoCalls.some(
      ([msg, meta]) => msg === '📥 Incoming request' && meta?.event?.path === baseEvent.path,
    );
    expect(hasIncoming).toBe(true);

    expect(logger.debug).toHaveBeenCalledWith('✅ List products ', adapterResponse);
    expect(logger.error).not.toHaveBeenCalled();
    expect(toHttpResponse).not.toHaveBeenCalled();
  });

  it('mapea errores con toHttpResponse y loguea error', async () => {
    const thrown = new Error('adapter failed');
    const mapped: APIGatewayProxyResult = {
      statusCode: 500,
      headers: { 'content-type': 'application/json' } as any,
      body: JSON.stringify({ code: 'INTERNAL_ERROR', message: 'oops' }),
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (listProductsHttpAdapter as jest.Mock).mockImplementation((_doCase: any) => {
      return jest.fn(async () => {
        throw thrown;
      });
    });
    (toHttpResponse as jest.Mock).mockReturnValue(mapped);

    const res = await handler(baseEvent);

    expect(listProductsHttpAdapter).toHaveBeenCalledTimes(1);
    expect(_200_OK_).not.toHaveBeenCalled();

    expect(toHttpResponse).toHaveBeenCalledWith(thrown);
    expect(res).toEqual(mapped);

    const infoCalls = (logger.info as jest.Mock).mock.calls;
    const hasIncoming = infoCalls.some(([msg]) => msg === '📥 Incoming request');
    expect(hasIncoming).toBe(true);

    expect(logger.debug).not.toHaveBeenCalledWith('✅ List products ', expect.anything());
    expect(logger.error).toHaveBeenCalledWith('❌ Error in list products', { err: thrown });
  });
});
