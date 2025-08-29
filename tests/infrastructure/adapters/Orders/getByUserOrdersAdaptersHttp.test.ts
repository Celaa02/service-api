import { APIGatewayProxyEvent } from 'aws-lambda';

import { getByUserOrdersDependencies } from '../../../../src/case/useCaseGetByUserOders/getByUserOrdersDepencies';
import { getByUsrOrderType } from '../../../../src/case/useCaseGetByUserOders/getByUserOrdersType';
import { getByUserOrdersHttpAdapter } from '../../../../src/infrastructure/adapters/Orders/getByUserOrdersAdaptersHttp';

describe('getByUserOrdersHttpAdapter', () => {
  const makeEvent = (userId?: string, limit?: string): APIGatewayProxyEvent =>
    ({
      body: null,
      headers: {},
      httpMethod: 'GET',
      isBase64Encoded: false,
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      path: userId ? `/orders/user/${userId}` : '/orders/user',
      pathParameters: userId ? ({ userId } as any) : undefined,
      queryStringParameters: limit ? ({ limit } as any) : undefined,
      requestContext: {} as any,
      resource: '/orders/user/{userId}',
      stageVariables: null,
    }) as unknown as APIGatewayProxyEvent;

  let dependencies: getByUserOrdersDependencies;

  beforeEach(() => {
    dependencies = {
      repository: {} as any,
      logger: { info: jest.fn() } as any,
    };
    jest.clearAllMocks();
  });

  it('loguea el evento, castea limit a número, invoca el use case y retorna la respuesta', async () => {
    const doCase: jest.MockedFunction<getByUsrOrderType> = jest.fn().mockResolvedValue({
      items: [{ id: 'o1', total: 10, createdAt: '2025-01-01T00:00:00.000Z', status: 'CONFIRMED' }],
      nextCursor: undefined,
    });

    const adapter = getByUserOrdersHttpAdapter(doCase);
    const event = makeEvent('user-1', '25');

    const result = await adapter(event, dependencies);

    expect(dependencies.logger.info).toHaveBeenCalledWith(event);

    expect(doCase).toHaveBeenCalledTimes(1);
    expect(doCase).toHaveBeenCalledWith(dependencies, { userId: 'user-1', limit: 25 });

    expect(result).toEqual({
      items: [{ id: 'o1', total: 10, createdAt: '2025-01-01T00:00:00.000Z', status: 'CONFIRMED' }],
      nextCursor: undefined,
    });
  });

  it('lanza error si falta userId en pathParameters', async () => {
    const doCase: jest.MockedFunction<getByUsrOrderType> = jest.fn();

    const adapter = getByUserOrdersHttpAdapter(doCase);
    const event = makeEvent(undefined, '10');

    await expect(adapter(event, dependencies)).rejects.toThrow(
      'Request pathParametersor or queryStringParameters is required',
    );

    expect(doCase).not.toHaveBeenCalled();

    expect(dependencies.logger.info).toHaveBeenCalledWith(event);
  });

  it('lanza error si falta limit en queryStringParameters', async () => {
    const doCase: jest.MockedFunction<getByUsrOrderType> = jest.fn();

    const adapter = getByUserOrdersHttpAdapter(doCase);
    const event = makeEvent('user-1', undefined);

    await expect(adapter(event, dependencies)).rejects.toThrow(
      'Request pathParametersor or queryStringParameters is required',
    );

    expect(doCase).not.toHaveBeenCalled();
    expect(dependencies.logger.info).toHaveBeenCalledWith(event);
  });
});
