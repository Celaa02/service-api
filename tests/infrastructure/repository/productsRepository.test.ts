import { productCreate } from '../../../src/domain/models/ProductsMondels';

describe('ProductRepositoryDynamoDB.createProduct', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    jest.clearAllMocks();
  });

  it('envía PutCommand con el Item recibido y retorna el response mapeado', async () => {
    jest.resetModules();
    process.env.PRODUCTS_TABLE_NAME = 'aws-crud-api-dev-products';

    // Mocks locales QUE COMPARTIREMOS con el módulo bajo prueba
    const sendMock = jest.fn().mockResolvedValue({});
    const putCommandMock = jest.fn().mockImplementation((input) => ({ input }));
    const mapDynamoErrorMock = jest.fn();

    // Inyectamos los mocks por referencia
    jest.doMock('../../../src/infrastructure/database/DynamonDB', () => ({
      ddbDoc: { send: sendMock },
    }));
    jest.doMock('@aws-sdk/lib-dynamodb', () => ({
      PutCommand: putCommandMock,
    }));
    jest.doMock('../../../src/utils/mapDynamonError', () => ({
      mapDynamoError: mapDynamoErrorMock,
    }));

    let ProductRepositoryDynamoDB: any;
    await jest.isolateModulesAsync(async () => {
      ({ ProductRepositoryDynamoDB } = await import(
        '../../../src/infrastructure/repository/productsRepository'
      ));
    });

    const repo = new ProductRepositoryDynamoDB();

    const input: productCreate = {
      productId: 'p-1',
      name: 'Teclado Mecánico',
      price: 120.5,
      stock: 15,
      createdAt: '2025-01-01T00:00:00.000Z',
    } as any;

    const result = await repo.createProduct(input);

    expect(sendMock).toHaveBeenCalledTimes(1);
    const sentCmd = sendMock.mock.calls[0][0] as { input: any };
    expect(putCommandMock).toHaveBeenCalledTimes(1);
    expect(sentCmd.input.TableName).toBe('aws-crud-api-dev-products');
    expect(sentCmd.input.ConditionExpression).toBe('attribute_not_exists(productId)');
    expect(sentCmd.input.Item).toEqual(input);

    expect(result).toEqual({
      productId: 'p-1',
      name: 'Teclado Mecánico',
      price: 120.5,
      stock: 15,
      status: 'ACTIVE',
      createdAt: '2025-01-01T00:00:00.000Z',
    });

    expect(mapDynamoErrorMock).not.toHaveBeenCalled();
  });

  it('mapea y relanza el error si ddbDoc.send falla', async () => {
    jest.resetModules();
    process.env.PRODUCTS_TABLE_NAME = 'aws-crud-api-dev-products';

    const rawError = new Error('put failed');
    const sendMock = jest.fn().mockRejectedValue(rawError);
    const putCommandMock = jest.fn().mockImplementation((input) => ({ input }));
    const mapped = new Error('mapped-error');
    const mapDynamoErrorMock = jest.fn().mockReturnValue(mapped);

    const consoleErrSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.doMock('../../../src/infrastructure/database/DynamonDB', () => ({
      ddbDoc: { send: sendMock },
    }));
    jest.doMock('@aws-sdk/lib-dynamodb', () => ({
      PutCommand: putCommandMock,
    }));
    jest.doMock('../../../src/utils/mapDynamonError', () => ({
      mapDynamoError: mapDynamoErrorMock,
    }));

    let ProductRepositoryDynamoDB: any;
    await jest.isolateModulesAsync(async () => {
      ({ ProductRepositoryDynamoDB } = await import(
        '../../../src/infrastructure/repository/productsRepository'
      ));
    });

    const repo = new ProductRepositoryDynamoDB();

    const input: productCreate = {
      productId: 'p-2',
      name: 'Mouse',
      price: 35,
      stock: 50,
      createdAt: '2025-01-02T00:00:00.000Z',
    } as any;

    await expect(repo.createProduct(input)).rejects.toBe(mapped);

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(mapDynamoErrorMock).toHaveBeenCalledWith(rawError);

    consoleErrSpy.mockRestore();
  });
});
