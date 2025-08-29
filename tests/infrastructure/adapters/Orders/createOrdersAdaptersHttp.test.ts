import { APIGatewayProxyEvent } from 'aws-lambda';

import { createOrdersDependencies } from '../../../../src/case/useCaseCreateOrders/CreateOrdersDepencies';
import { createOrderType } from '../../../../src/case/useCaseCreateOrders/createOrdersType';
import { createOrders } from '../../../../src/domain/models/OrdersModels';
import { createOrdersHttpAdapter } from '../../../../src/infrastructure/adapters/Orders/createOrdersAdaptersHttp';
import { parseBody } from '../../../../src/utils/utilsResponse';

jest.mock('../../../../src/utils/utilsResponse', () => ({
  parseBody: jest.fn(),
}));

describe('createOrdersHttpAdapter', () => {
  let doCaseMock: jest.MockedFunction<createOrderType>;
  let dependencies: createOrdersDependencies;
  let event: APIGatewayProxyEvent;

  beforeEach(() => {
    jest.clearAllMocks();

    doCaseMock = jest.fn() as unknown as jest.MockedFunction<createOrderType>;
    dependencies = {
      logger: {
        info: jest.fn(),
      },
    } as unknown as createOrdersDependencies;

    event = {
      body: JSON.stringify({ userId: 'u-1', items: [{ sku: 'A1', qty: 2 }] }),
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
    } as unknown as APIGatewayProxyEvent;
  });

  it('debe loguear, parsear el body, llamar al caso de uso y devolver su resultado', async () => {
    const parsed: createOrders = {
      userId: 'u-1',
      items: [{ productId: 'A1', qty: 2 }],
      total: 5,
      status: 'CREATED',
    };
    (parseBody as jest.Mock).mockReturnValue(parsed);

    const expectedResult = { statusCode: 201, body: JSON.stringify({ ok: true }) };
    (doCaseMock as unknown as jest.Mock).mockResolvedValue(expectedResult);

    const adapter = createOrdersHttpAdapter(doCaseMock);
    const result = await adapter(event, dependencies);

    expect(dependencies.logger.info).toHaveBeenCalledWith(event);

    expect(parseBody).toHaveBeenCalledWith(event);

    expect(doCaseMock as unknown as jest.Mock).toHaveBeenCalledWith(dependencies, {
      userId: 'u-1',
      items: [{ productId: 'A1', qty: 2 }],
      total: 5,
      status: 'CREATED',
    });

    expect(result).toBe(expectedResult);
  });

  it('debe lanzar error si falta event.body', async () => {
    event.body = null as unknown as string;

    const adapter = createOrdersHttpAdapter(doCaseMock);
    await expect(adapter(event, dependencies)).rejects.toThrow('Request body is required');

    expect(dependencies.logger.info).toHaveBeenCalledWith(event);

    expect(parseBody).not.toHaveBeenCalled();
    expect(doCaseMock as unknown as jest.Mock).not.toHaveBeenCalled();
  });

  it('debe construir el input solo con userId e items del body', async () => {
    (parseBody as jest.Mock).mockReturnValue({
      userId: 'u-2',
      items: [{ productId: 'B2', qty: 1 }],
      ignored: 'should-not-pass',
    });

    (doCaseMock as unknown as jest.Mock).mockResolvedValue({ ok: true });

    const adapter = createOrdersHttpAdapter(doCaseMock);
    await adapter(event, dependencies);

    expect(doCaseMock as unknown as jest.Mock).toHaveBeenCalledWith(dependencies, {
      userId: 'u-2',
      items: [{ productId: 'B2', qty: 1 }],
    });
  });
});
