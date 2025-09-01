import { APIGatewayProxyEvent } from 'aws-lambda';

import { statusConfirmOrdersDependencies } from '../../../../src/case/statusConfirmOders/statusConfirmOrdersDepencies';
import { statusConfirmOrderType } from '../../../../src/case/statusConfirmOders/statusConfrimOrdersType';
import { confirmStatusOrdersHttpAdapter } from '../../../../src/infrastructure/adapters/Orders/confirmStatusOrdersAdaptersHttp';

jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto');
  return {
    ...actual,
    randomUUID: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
  };
});

describe('confirmStatusOrdersHttpAdapter', () => {
  const makeEvent = (orderId?: string): APIGatewayProxyEvent =>
    ({
      body: null,
      headers: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      path: orderId ? `/orders/${orderId}/confirm` : '/orders/confirm',
      pathParameters: orderId ? ({ orderId } as any) : undefined,
      queryStringParameters: null,
      requestContext: {} as any,
      resource: '/orders/{orderId}/confirm',
      stageVariables: null,
    }) as unknown as APIGatewayProxyEvent;

  let dependencies: statusConfirmOrdersDependencies;

  beforeEach(() => {
    dependencies = {
      repositoryOrders: {} as any,
      repositoryProduct: {} as any,
      logger: { info: jest.fn() } as any,
    };
    jest.clearAllMocks();
  });

  it('loguea el evento, genera paymentId con randomUUID, invoca el use case y retorna la respuesta', async () => {
    const doCase: jest.MockedFunction<statusConfirmOrderType> = jest.fn().mockResolvedValue({
      orderId: 'ord-1',
      status: 'CONFIRMED',
      confirmedAt: '2025-01-01T00:00:00.000Z',
    });

    const adapter = confirmStatusOrdersHttpAdapter(doCase);
    const event = makeEvent('ord-1');

    const result = await adapter(event, dependencies);

    expect(dependencies.logger.info).toHaveBeenCalledWith(event);

    expect(doCase).toHaveBeenCalledTimes(1);
    expect(doCase).toHaveBeenCalledWith(dependencies, {
      orderId: 'ord-1',
      paymentId: '123e4567-e89b-12d3-a456-426614174000',
    });

    expect(result).toEqual({
      orderId: 'ord-1',
      status: 'CONFIRMED',
      confirmedAt: '2025-01-01T00:00:00.000Z',
    });
  });

  it('lanza error si falta pathParameters.orderId', async () => {
    const doCase: jest.MockedFunction<statusConfirmOrderType> = jest.fn();

    const adapter = confirmStatusOrdersHttpAdapter(doCase);
    const event = makeEvent(undefined);

    await expect(adapter(event, dependencies)).rejects.toThrow(
      'Request pathParametersor is required',
    );

    expect(doCase).not.toHaveBeenCalled();
    expect(dependencies.logger.info).toHaveBeenCalledWith(event);
  });
});
