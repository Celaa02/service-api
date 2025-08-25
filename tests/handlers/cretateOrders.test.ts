import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// eslint-disable-next-line import/order
import { handler } from '../../src/handlers/createOrders';

import { createOrdersSchema } from '../../src/handlers/schemas/createOrdersSchemaHttp';
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

  it('should validate input, build 201 response and log success path', async () => {
    const validated = { orderId: 'abc-123', amount: 50 };
    const successResponse: APIGatewayProxyResult = {
      statusCode: 201,
      body: JSON.stringify({ ok: true }),
      headers: { 'content-type': 'application/json' },
    };

    (validationHttps as jest.Mock).mockResolvedValue(validated);
    (_201_CREATED_ as jest.Mock).mockReturnValue(successResponse);

    const res = await handler(baseEvent);

    expect(validationHttps).toHaveBeenCalledWith(baseEvent, createOrdersSchema);
    expect(_201_CREATED_).toHaveBeenCalledWith(validated);
    expect(res).toEqual(successResponse);

    expect(logger.info).toHaveBeenNthCalledWith(1, '📥 Incoming request', { event: baseEvent });
    expect(logger.debug).toHaveBeenCalledWith('✅ Validation passed', validated);
    expect(logger.info).toHaveBeenNthCalledWith(2, '✅ sent response', successResponse);
    expect(logger.error).not.toHaveBeenCalled();
    expect(toHttpResponse).not.toHaveBeenCalled();
  });

  it('should map validation error to http error response and log it', async () => {
    const thrown = new Error('validation failed');
    const mapped: APIGatewayProxyResult = {
      statusCode: 400,
      body: JSON.stringify({ message: 'bad request' }),
    };

    (validationHttps as jest.Mock).mockRejectedValue(thrown);
    (toHttpResponse as jest.Mock).mockReturnValue(mapped);

    const res = await handler(baseEvent);

    expect(validationHttps).toHaveBeenCalledWith(baseEvent, createOrdersSchema);
    expect(toHttpResponse).toHaveBeenCalledWith(thrown);
    expect(res).toEqual(mapped);

    expect(logger.info).toHaveBeenCalledWith('📥 Incoming request', { event: baseEvent });
    expect(logger.debug).not.toHaveBeenCalled(); // no hay validación exitosa
    expect(logger.info).not.toHaveBeenCalledWith('✅ sent response', expect.anything());
    expect(logger.error).toHaveBeenCalledWith('❌ Error in createOrder', { err: thrown });
  });
});
