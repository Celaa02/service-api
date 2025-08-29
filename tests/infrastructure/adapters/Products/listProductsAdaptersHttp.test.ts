import { APIGatewayProxyEvent } from 'aws-lambda';

import { listProductsDependencies } from '../../../../src/case/useCaseListProducts/listProductsDepencies';
import { listProductsType } from '../../../../src/case/useCaseListProducts/listProductsType';
import { listProductsHttpAdapter } from '../../../../src/infrastructure/adapters/Products/listProductsAdaptersHttp';

describe('listProductsHttpAdapter', () => {
  const makeEvent = (): APIGatewayProxyEvent =>
    ({
      body: null,
      headers: {},
      httpMethod: 'GET',
      isBase64Encoded: false,
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      path: '/products',
      pathParameters: null,
      queryStringParameters: { limit: '10' } as any,
      requestContext: {} as any,
      resource: '/products',
      stageVariables: null,
    }) as unknown as APIGatewayProxyEvent;

  let dependencies: listProductsDependencies;

  beforeEach(() => {
    dependencies = {
      repository: {} as any,
      logger: { info: jest.fn() } as any,
    };
    jest.clearAllMocks();
  });

  it('loguea el evento, llama al use case con dependencies y retorna su respuesta', async () => {
    const expected = {
      items: [
        {
          productId: 'p1',
          name: 'Mouse',
          price: 35,
          status: 'ACTIVE',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      nextCursor: undefined,
    };

    const doCase: jest.MockedFunction<listProductsType> = jest.fn().mockResolvedValue(expected);

    const adapter = listProductsHttpAdapter(doCase);
    const event = makeEvent();
    const result = await adapter(event, dependencies);

    expect(dependencies.logger.info).toHaveBeenCalledWith(event);

    expect(doCase).toHaveBeenCalledTimes(1);
    expect(doCase).toHaveBeenCalledWith(dependencies);
    expect(result).toBe(expected);
  });

  it('propaga el error si el use case lanza (y loguea el evento)', async () => {
    const thrown = new Error('boom');
    const doCase: jest.MockedFunction<listProductsType> = jest.fn().mockRejectedValue(thrown);

    const adapter = listProductsHttpAdapter(doCase);
    const event = makeEvent();

    await expect(adapter(event, dependencies)).rejects.toThrow(thrown);
    expect(dependencies.logger.info).toHaveBeenCalledWith(event);
    expect(doCase).toHaveBeenCalledWith(dependencies);
  });
});
