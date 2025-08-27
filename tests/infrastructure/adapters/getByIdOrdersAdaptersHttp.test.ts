import { APIGatewayProxyEvent } from 'aws-lambda';

import { getByIdOrdersDependencies } from '../../../src/domain/case/dependencies/getByIdOrders/getByIdOrdersDepencies';
import { getByIdOrderType } from '../../../src/domain/case/dependencies/getByIdOrders/getByIdOrdersType';
import { getByIdOrdersHttpAdapter } from '../../../src/infrastructure/adapters/getByIdOrdersAdaptersHttp';

describe('getByIdOrdersHttpAdapter', () => {
  const makeEvent = (id?: string): APIGatewayProxyEvent =>
    ({
      body: null,
      headers: {},
      httpMethod: 'GET',
      isBase64Encoded: false,
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      path: id ? `/orders/${id}` : '/orders',
      pathParameters: id ? ({ id } as any) : undefined,
      queryStringParameters: null,
      requestContext: {} as any,
      resource: '/orders/{id}',
      stageVariables: null,
    }) as unknown as APIGatewayProxyEvent;

  let dependencies: getByIdOrdersDependencies;

  beforeEach(() => {
    dependencies = {
      repository: {} as any,
      logger: {
        info: jest.fn(),
      } as any,
    };
    jest.clearAllMocks();
  });

  it('debe loguear el evento, invocar el use case con orderId e informar la respuesta', async () => {
    const doCase: jest.MockedFunction<getByIdOrderType> = jest.fn().mockResolvedValue({
      orderId: '123',
      userId: 'user-1',
      items: [{ sku: 'A1', qty: 1 }],
    });

    const adapter = getByIdOrdersHttpAdapter(doCase);
    const event = makeEvent('123');

    const result = await adapter(event, dependencies);

    expect(dependencies.logger.info).toHaveBeenCalledWith(event);

    expect(doCase).toHaveBeenCalledTimes(1);
    expect(doCase).toHaveBeenCalledWith(dependencies, { orderId: '123' });

    // retorno
    expect(result).toEqual({
      orderId: '123',
      userId: 'user-1',
      items: [{ sku: 'A1', qty: 1 }],
    });
  });

  it('debe lanzar error si no viene pathParameters.id', async () => {
    const doCase: jest.MockedFunction<getByIdOrderType> = jest.fn();

    const adapter = getByIdOrdersHttpAdapter(doCase);
    const event = makeEvent(undefined);

    await expect(adapter(event, dependencies)).rejects.toThrow(
      'Request pathParameters is required',
    );

    expect(doCase).not.toHaveBeenCalled();
    expect(dependencies.logger.info).toHaveBeenCalledWith(event);
  });
});
