import { APIGatewayProxyEvent } from 'aws-lambda';

import { deleteByIdProductsDependencies } from '../../../../src/case/useCaseDeleteByIdProducts/deleteByIdOrdersDepencies';
import { deleteByIdProductsType } from '../../../../src/case/useCaseDeleteByIdProducts/deleteByIdOrdersType';
import { deleteByIdProductsHttpAdapter } from '../../../../src/infrastructure/adapters/Products/deleteByIdProductsAdaptersHttp';

const makeEvent = (overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent =>
  ({
    body: null,
    headers: {},
    httpMethod: 'DELETE',
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    path: '/products/prod-123',
    pathParameters: { productId: 'prod-123' },
    queryStringParameters: null,
    requestContext: {} as any,
    resource: '/products/{productId}',
    stageVariables: null,
    ...overrides,
  }) as unknown as APIGatewayProxyEvent;

describe('deleteByIdProductsHttpAdapter', () => {
  let dependencies: deleteByIdProductsDependencies;
  let doCase: jest.MockedFunction<deleteByIdProductsType>;

  beforeEach(() => {
    jest.clearAllMocks();
    dependencies = {
      repository: {} as any,
      logger: { info: jest.fn() } as any,
    } as unknown as deleteByIdProductsDependencies;

    doCase = jest.fn() as any;
  });

  it('camino feliz: loguea, llama doCase con (dependencies, productId) y retorna la respuesta', async () => {
    const event = makeEvent();
    const expectedResponse = { productId: 'prod-123', deleted: true };
    doCase.mockResolvedValue(expectedResponse);

    const adapter = deleteByIdProductsHttpAdapter(doCase);
    const res = await adapter(event, dependencies);

    expect(dependencies.logger.info).toHaveBeenCalledWith(event);
    expect(doCase).toHaveBeenCalledTimes(1);
    expect(doCase).toHaveBeenCalledWith(dependencies, 'prod-123');
    expect(res).toEqual(expectedResponse);
  });

  it('lanza error si falta productId en pathParameters y no llama al caso de uso', async () => {
    const event = makeEvent({ pathParameters: undefined });

    const adapter = deleteByIdProductsHttpAdapter(doCase);

    await expect(adapter(event, dependencies)).rejects.toThrow(
      'Request pathParameters is required',
    );
    expect(dependencies.logger.info).toHaveBeenCalledWith(event);
    expect(doCase).not.toHaveBeenCalled();
  });
});
