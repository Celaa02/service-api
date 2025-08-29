import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { handler } from '../../src/handlers/createOrders';
import { bodySchema } from '../../src/handlers/schemas/Orders/createOrdersSchemaHttp';
import { createOrdersHttpAdapter } from '../../src/infrastructure/adapters/Orders/createOrdersAdaptersHttp';
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

jest.mock('../../src/infrastructure/repository/ordersRepository', () => ({
  OrderRepositoryDynamoDB: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../../src/infrastructure/adapters/Orders/createOrdersAdaptersHttp', () => ({
  createOrdersHttpAdapter: jest.fn(),
}));

describe('createOrder.handler', () => {
  const baseEvent: APIGatewayProxyEvent = {
    body: '{"foo":"bar"}',
    headers: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    path: '/orders',
    pathParameters: null,
    queryStringParameters: null,
    requestContext: {} as any,
    resource: '/orders',
    stageVariables: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('valida input, ejecuta adapter, retorna 201 y hace logs de éxito', async () => {
    const validated = { userId: 'u1', items: [{ sku: 'A1', qty: 1 }] };
    const adapterResponse = { orderId: 'abc-123', userId: 'u1' };
    const successResponse: APIGatewayProxyResult = {
      statusCode: 201,
      body: JSON.stringify(adapterResponse),
      headers: { 'content-type': 'application/json' },
    };

    (validationHttps as jest.Mock).mockResolvedValue(validated);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (createOrdersHttpAdapter as jest.Mock).mockImplementation((_doCase: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return jest.fn(async (_event: APIGatewayProxyEvent, _deps: unknown) => {
        return adapterResponse;
      });
    });

    (_201_CREATED_ as jest.Mock).mockReturnValue(successResponse);

    const res = await handler(baseEvent);

    expect(validationHttps).toHaveBeenCalledWith(baseEvent, { bodySchema });

    expect(createOrdersHttpAdapter).toHaveBeenCalledTimes(1);
    expect(_201_CREATED_).toHaveBeenCalledWith(adapterResponse);
    expect(res).toEqual(successResponse);

    expect(logger.info).toHaveBeenCalledWith('📥 Incoming request', { event: baseEvent });
    expect(logger.debug).toHaveBeenNthCalledWith(1, '✅ Validation passed', validated);
    expect(logger.debug).toHaveBeenNthCalledWith(2, '✅ Order created ', adapterResponse);
    expect(logger.error).not.toHaveBeenCalled();
    expect(toHttpResponse).not.toHaveBeenCalled();
  });

  it('mapea errores a http con toHttpResponse y los loguea', async () => {
    const thrown = new Error('validation failed');
    const mapped: APIGatewayProxyResult = {
      statusCode: 400,
      body: JSON.stringify({ message: 'bad request' }),
      headers: { 'content-type': 'application/json' } as any,
    };

    (validationHttps as jest.Mock).mockRejectedValue(thrown);
    (toHttpResponse as jest.Mock).mockReturnValue(mapped);

    const res = await handler(baseEvent);

    expect(validationHttps).toHaveBeenCalledWith(baseEvent, { bodySchema });
    expect(createOrdersHttpAdapter).not.toHaveBeenCalled(); // no se llega al adapter
    expect(_201_CREATED_).not.toHaveBeenCalled();
    expect(toHttpResponse).toHaveBeenCalledWith(thrown);
    expect(res).toEqual(mapped);

    expect(logger.info).toHaveBeenCalledWith('📥 Incoming request', { event: baseEvent });
    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('❌ Error in createOrder', { err: thrown });
  });
});
