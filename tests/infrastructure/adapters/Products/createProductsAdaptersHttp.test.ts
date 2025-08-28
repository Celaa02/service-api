import { APIGatewayProxyEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';

import { createProductsDependencies } from '../../../../src/case/useCaseCreateProducts/CreateProductsDepencies';
import { createProductsType } from '../../../../src/case/useCaseCreateProducts/createProductsType';
import { productCreate } from '../../../../src/domain/models/ProductsMondels';
import { createProductsHttpAdapter } from '../../../../src/infrastructure/adapters/Products/createProductsAdaptersHttp';
import { parseBody } from '../../../../src/utils/utilsResponse';

jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto');
  return {
    ...actual,
    randomUUID: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
  };
});

jest.mock('../../../../src/utils/utilsResponse', () => {
  const actual = jest.requireActual('../../../../src/utils/utilsResponse');
  return {
    ...actual,
    parseBody: jest.fn((event: APIGatewayProxyEvent) => JSON.parse(event.body as string)),
  };
});

describe('createProductsHttpAdapter', () => {
  const makeEvent = (body?: object): APIGatewayProxyEvent =>
    ({
      body: body ? JSON.stringify(body) : null,
      headers: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      path: '/products',
      pathParameters: null,
      queryStringParameters: null,
      requestContext: {} as any,
      resource: '/products',
      stageVariables: null,
    }) as unknown as APIGatewayProxyEvent;

  let dependencies: createProductsDependencies;

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    dependencies = {
      repository: {} as any,
      logger: { info: jest.fn() } as any,
    };
    jest.clearAllMocks();
  });

  it('loguea el evento, construye el input con randomUUID y createdAt, invoca el use case y retorna la respuesta', async () => {
    const doCase: jest.MockedFunction<createProductsType> = jest.fn().mockResolvedValue({
      productId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Teclado',
      price: 120.5,
      stock: 10,
      createdAt: '2025-01-01T00:00:00.000Z',
      status: 'NEW',
    });

    const adapter = createProductsHttpAdapter(doCase);

    const body = {
      name: 'Teclado',
      price: 120.5,
      stock: 10,
      status: 'NEW',
    };
    const event = makeEvent(body);

    const result = await adapter(event, dependencies);

    expect(dependencies.logger.info).toHaveBeenCalledWith(event);

    expect(parseBody).toHaveBeenCalledTimes(1);
    expect(parseBody).toHaveBeenCalledWith(event);

    expect(randomUUID).toHaveBeenCalledTimes(1);

    expect(doCase).toHaveBeenCalledTimes(1);
    expect(doCase).toHaveBeenCalledWith(dependencies, {
      productId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Teclado',
      price: 120.5,
      stock: 10,
      status: 'NEW',
      createdAt: '2025-01-01T00:00:00.000Z',
    } as unknown as productCreate);

    expect(result).toEqual({
      productId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Teclado',
      price: 120.5,
      stock: 10,
      createdAt: '2025-01-01T00:00:00.000Z',
      status: 'NEW',
    });
  });

  it('lanza error si falta event.body y no llama al use case', async () => {
    const doCase: jest.MockedFunction<createProductsType> = jest.fn();
    const adapter = createProductsHttpAdapter(doCase);
    const event = makeEvent(undefined);

    await expect(adapter(event, dependencies)).rejects.toThrow('Request body is required');

    expect(dependencies.logger.info).toHaveBeenCalledWith(event);
    expect(parseBody).not.toHaveBeenCalled();
    expect(doCase).not.toHaveBeenCalled();
  });
});
