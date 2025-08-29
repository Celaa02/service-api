import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { pathSchema } from '../../src/handlers/schemas/Orders/statusConfirmOrdersSchemaHttp';
import { handler } from '../../src/handlers/statusOrdersConfirm';
import { confirmStatusOrdersHttpAdapter } from '../../src/infrastructure/adapters/Orders/confirmStatusOrdersAdaptersHttp';
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

jest.mock('../../src/infrastructure/repository/ordersRepository', () => ({
  OrderRepositoryDynamoDB: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../../src/infrastructure/adapters/Orders/confirmStatusOrdersAdaptersHttp', () => ({
  confirmStatusOrdersHttpAdapter: jest.fn(),
}));

describe('statusConfirmOrders.handler', () => {
  const baseEvent: APIGatewayProxyEvent = {
    body: JSON.stringify({ orderId: 'ord-1', userId: 'user-1' }),
    headers: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    path: '/orders/confirm',
    pathParameters: null,
    queryStringParameters: null,
    requestContext: {} as any,
    resource: '/orders/confirm',
    stageVariables: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('valida, ejecuta adapter y retorna 200 OK con logs de éxito', async () => {
    const validated = { orderId: 'ord-1', userId: 'user-1' };

    const adapterResponse = {
      orderId: 'ord-1',
      status: 'CONFIRMED',
      confirmedAt: '2025-01-01T00:00:00.000Z',
    };

    const okResponse: APIGatewayProxyResult = {
      statusCode: 200,
      headers: { 'content-type': 'application/json' } as any,
      body: JSON.stringify(adapterResponse),
    };

    (validationHttps as jest.Mock).mockResolvedValue(validated);

    // Adapter factory devuelve función que retorna la respuesta
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (confirmStatusOrdersHttpAdapter as jest.Mock).mockImplementation((_doCase: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return jest.fn(async (_event: APIGatewayProxyEvent, _deps: any) => adapterResponse);
    });

    (_200_OK_ as jest.Mock).mockReturnValue(okResponse);

    const res = await handler(baseEvent);

    expect(validationHttps).toHaveBeenCalledWith(baseEvent, { pathSchema });

    expect(confirmStatusOrdersHttpAdapter).toHaveBeenCalledTimes(1);

    expect(_200_OK_).toHaveBeenCalledWith(adapterResponse);
    expect(res).toEqual(okResponse);

    expect(logger.info).toHaveBeenCalledWith('📥 Incoming request', { event: baseEvent });
    expect(logger.debug).toHaveBeenCalledWith('✅ Validation passed', validated);
    expect(logger.info).toHaveBeenCalledWith('✅ Get order user', adapterResponse);
    expect(logger.error).not.toHaveBeenCalled();
    expect(toHttpResponse).not.toHaveBeenCalled();
  });

  it('si el adapter devuelve null, responde 404 NOT FOUND con el payload esperado', async () => {
    const validated = { orderId: 'ord-1', userId: 'user-1' };
    const notFoundResponse: APIGatewayProxyResult = {
      statusCode: 404,
      headers: { 'content-type': 'application/json' } as any,
      body: JSON.stringify({
        message: 'Order not in CREATED status, cannot confirm.',
        data: [],
      }),
    };

    (validationHttps as jest.Mock).mockResolvedValue(validated);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (confirmStatusOrdersHttpAdapter as jest.Mock).mockImplementation((_doCase: any) => {
      return jest.fn(async () => null);
    });
    (_404_NOT_FOUND_ as jest.Mock).mockReturnValue(notFoundResponse);

    const res = await handler(baseEvent);

    expect(validationHttps).toHaveBeenCalledWith(baseEvent, { pathSchema });
    expect(confirmStatusOrdersHttpAdapter).toHaveBeenCalledTimes(1);

    expect(_404_NOT_FOUND_).toHaveBeenCalledWith({
      message: 'Order not in CREATED status, cannot confirm.',
      data: [],
    });
    expect(res).toEqual(notFoundResponse);

    expect(logger.info).toHaveBeenCalledWith('📥 Incoming request', { event: baseEvent });
    expect(logger.debug).toHaveBeenCalledWith('✅ Validation passed', validated);
    expect(logger.info).toHaveBeenCalledWith('✅ Get order user', null);
    expect(logger.error).not.toHaveBeenCalled();
    expect(toHttpResponse).not.toHaveBeenCalled();
  });

  it('mapea errores con toHttpResponse y loguea error', async () => {
    const thrown = new Error('validation failed');
    const mapped: APIGatewayProxyResult = {
      statusCode: 400,
      headers: { 'content-type': 'application/json' } as any,
      body: JSON.stringify({ code: 'BAD', message: 'bad' }),
    };

    (validationHttps as jest.Mock).mockRejectedValue(thrown);
    (toHttpResponse as jest.Mock).mockReturnValue(mapped);

    const res = await handler(baseEvent);

    expect(validationHttps).toHaveBeenCalledWith(baseEvent, { pathSchema });
    expect(confirmStatusOrdersHttpAdapter).not.toHaveBeenCalled();
    expect(_200_OK_).not.toHaveBeenCalled();
    expect(_404_NOT_FOUND_).not.toHaveBeenCalled();

    expect(toHttpResponse).toHaveBeenCalledWith(thrown);
    expect(res).toEqual(mapped);

    expect(logger.info).toHaveBeenCalledWith('📥 Incoming request', { event: baseEvent });
    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('❌ Error in get order user', { err: thrown });
  });
});
