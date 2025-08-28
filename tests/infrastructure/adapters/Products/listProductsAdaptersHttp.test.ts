import { APIGatewayProxyEvent } from 'aws-lambda';

import { listProductsDependencies } from '../../../../src/case/useCaseListProducts/listProductsDepencies';
import { listProductsType } from '../../../../src/case/useCaseListProducts/listProductsType';
import { listProductsHttpAdapter } from '../../../../src/infrastructure/adapters/Products/listProductsAdaptersHttp';

describe('listProductsHttpAdapter', () => {
  const makeEvent = (limit?: string, cursor?: string): APIGatewayProxyEvent =>
    ({
      body: null,
      headers: {},
      httpMethod: 'GET',
      isBase64Encoded: false,
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      path: '/products',
      pathParameters: null,
      queryStringParameters:
        limit !== undefined || cursor !== undefined ? ({ limit, cursor } as any) : undefined,
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

  it('loguea el evento, castea limit a número, pasa cursor y retorna la respuesta del use case', async () => {
    const doCase: jest.MockedFunction<listProductsType> = jest.fn().mockResolvedValue({
      items: [
        {
          productId: 'p-1',
          name: 'Teclado',
          price: 120.5,
          stock: 10,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      nextCursor: 'abc',
    });

    const adapter = listProductsHttpAdapter(doCase);
    const event = makeEvent('25', 'fooCursor');

    const result = await adapter(event, dependencies);

    expect(dependencies.logger.info).toHaveBeenCalledWith(event);

    expect(doCase).toHaveBeenCalledTimes(1);
    expect(doCase).toHaveBeenCalledWith(dependencies, {
      limit: 25,
      cursor: 'fooCursor',
    });

    expect(result).toEqual({
      items: [
        {
          productId: 'p-1',
          name: 'Teclado',
          price: 120.5,
          stock: 10,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      nextCursor: 'abc',
    });
  });

  it('lanza error si falta queryStringParameters.limit', async () => {
    const doCase: jest.MockedFunction<listProductsType> = jest.fn();

    const adapter = listProductsHttpAdapter(doCase);
    const event = makeEvent(undefined, 'cursorX');

    await expect(adapter(event, dependencies)).rejects.toThrow(
      'Request queryStringParameters is required',
    );

    expect(doCase).not.toHaveBeenCalled();
    expect(dependencies.logger.info).toHaveBeenCalledWith(event);
  });
});
