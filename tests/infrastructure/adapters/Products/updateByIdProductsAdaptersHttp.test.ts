import { APIGatewayProxyEvent } from 'aws-lambda';

import { updateByIdProductsDependencies } from '../../../../src/case/useCaseUpdateByIdProducts/updateByIdProductsDepencies';
import { updateByIdProductsType } from '../../../../src/case/useCaseUpdateByIdProducts/updateByIdProductsType';
import { updateByIdProductsHttpAdapter } from '../../../../src/infrastructure/adapters/Products/updateByIdProductsAdaptersHttp';
import { parseBody } from '../../../../src/utils/utilsResponse';

jest.mock('../../../../src/utils/utilsResponse', () => ({
  parseBody: jest.fn(),
}));

const makeEvent = (overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent =>
  ({
    body: '{"name":"Keyboard","price":100,"stock":10,"status":"ACTIVE"}',
    headers: {},
    httpMethod: 'PATCH',
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

describe('updateByIdProductsHttpAdapter', () => {
  const ORIGINAL_DATE = Date;

  let dependencies: updateByIdProductsDependencies;
  let doCase: jest.MockedFunction<updateByIdProductsType>;

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01T12:34:56.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
    global.Date = ORIGINAL_DATE;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    dependencies = {
      repository: {} as any,
      logger: { info: jest.fn() } as any,
    } as unknown as updateByIdProductsDependencies;

    doCase = jest.fn() as any;
  });

  it('camino feliz: parsea body, construye input con createdAt fijo, llama doCase y retorna respuesta', async () => {
    const event = makeEvent();

    (parseBody as jest.Mock).mockReturnValue({
      name: 'Keyboard',
      price: 100,
      stock: 10,
      status: 'ACTIVE',
    });

    const expectedResponse = {
      productId: 'prod-123',
      name: 'Keyboard',
      price: 100,
      stock: 10,
      status: 'ACTIVE',
      createdAt: '2025-01-01T12:34:56.000Z',
    };

    doCase.mockResolvedValue(expectedResponse);

    const adapter = updateByIdProductsHttpAdapter(doCase);
    const res = await adapter(event, dependencies);

    expect(dependencies.logger.info).toHaveBeenCalledWith(event);
    expect(parseBody).toHaveBeenCalledWith(event);

    expect(doCase).toHaveBeenCalledTimes(1);
    expect(doCase).toHaveBeenCalledWith(dependencies, {
      productId: 'prod-123',
      name: 'Keyboard',
      price: 100,
      stock: 10,
      status: 'ACTIVE',
      createdAt: '2025-01-01T12:34:56.000Z',
    });

    expect(res).toEqual(expectedResponse);
  });

  it('lanza error si falta productId en pathParameters', async () => {
    const event = makeEvent({ pathParameters: undefined });

    const adapter = updateByIdProductsHttpAdapter(doCase);

    await expect(adapter(event, dependencies)).rejects.toThrow(
      'Request pathParametersor is required',
    );

    expect(parseBody).not.toHaveBeenCalled();
    expect(doCase).not.toHaveBeenCalled();
  });
});
