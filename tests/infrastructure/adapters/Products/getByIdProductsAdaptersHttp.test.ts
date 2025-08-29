import { APIGatewayProxyEvent } from 'aws-lambda';

import { getByIdProductsDependencies } from '../../../../src/case/useCaseGetByIdProducts/getByIdOrdersDepencies';
import { getByIdProductsType } from '../../../../src/case/useCaseGetByIdProducts/getByIdOrdersType';
import { getByIdProductsHttpAdapter } from '../../../../src/infrastructure/adapters/Products/getByIdProductsAdaptersHttp';

describe('getByIdProductsHttpAdapter', () => {
  const makeEvent = (productId?: string): APIGatewayProxyEvent =>
    ({
      body: null,
      headers: {},
      httpMethod: 'GET',
      isBase64Encoded: false,
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      path: productId ? `/products/${productId}` : '/products',
      pathParameters: productId ? ({ productId } as any) : undefined,
      queryStringParameters: null,
      requestContext: {} as any,
      resource: '/products/{productId}',
      stageVariables: null,
    }) as unknown as APIGatewayProxyEvent;

  let dependencies: getByIdProductsDependencies;

  beforeEach(() => {
    dependencies = {
      repository: {} as any,
      logger: { info: jest.fn() } as any,
    };
    jest.clearAllMocks();
  });

  it('loguea el evento, toma productId de pathParameters y llama al use case, retornando su respuesta', async () => {
    const doCase: jest.MockedFunction<getByIdProductsType> = jest.fn().mockResolvedValue({
      productId: 'prod-123',
      name: 'Teclado',
      price: 120.5,
      stock: 10,
      status: 'ACTIVE',
      createdAt: '2025-01-01T00:00:00.000Z',
    });

    const adapter = getByIdProductsHttpAdapter(doCase);
    const event = makeEvent('prod-123');

    const result = await adapter(event, dependencies);

    expect(dependencies.logger.info).toHaveBeenCalledWith(event);

    expect(doCase).toHaveBeenCalledTimes(1);
    expect(doCase).toHaveBeenCalledWith(dependencies, 'prod-123');

    expect(result).toEqual({
      productId: 'prod-123',
      name: 'Teclado',
      price: 120.5,
      stock: 10,
      status: 'ACTIVE',
      createdAt: '2025-01-01T00:00:00.000Z',
    });
  });

  it('lanza error si falta pathParameters.productId y no llama al use case', async () => {
    const doCase: jest.MockedFunction<getByIdProductsType> = jest.fn();
    const adapter = getByIdProductsHttpAdapter(doCase);
    const event = makeEvent(undefined);

    await expect(adapter(event, dependencies)).rejects.toThrow(
      'Request pathParameters is required',
    );

    expect(dependencies.logger.info).toHaveBeenCalledWith(event);

    expect(doCase).not.toHaveBeenCalled();
  });
});
