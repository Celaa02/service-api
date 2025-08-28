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

    const sendMock = jest.fn().mockResolvedValue({});
    const putCommandMock = jest.fn().mockImplementation((input) => ({ input }));
    const mapDynamoErrorMock = jest.fn();

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

  describe('ProductRepositoryDynamoDB.listProducts', () => {
    const ORIGINAL_ENV = { ...process.env };

    afterEach(() => {
      process.env = { ...ORIGINAL_ENV };
      jest.clearAllMocks();
    });

    it('escanea sin cursor y mapea items (status/price por defecto) + sin nextCursor', async () => {
      jest.resetModules();
      process.env.PRODUCTS_TABLE_NAME = 'aws-crud-api-dev-products';

      const sendMock = jest.fn().mockResolvedValue({
        Items: [
          { productId: 'p-1', name: 'A', createdAt: '2025-01-01T00:00:00.000Z' },
          {
            productId: 'p-2',
            name: 'B',
            price: 10,
            status: 'INACTIVE',
            createdAt: '2025-01-02T00:00:00.000Z',
          },
        ],
        LastEvaluatedKey: undefined,
      });
      const scanCommandMock = jest.fn().mockImplementation((input) => ({ input }));
      const mapDynamoErrorMock = jest.fn();

      jest.doMock('../../../src/infrastructure/database/DynamonDB', () => ({
        ddbDoc: { send: sendMock },
      }));
      jest.doMock('@aws-sdk/lib-dynamodb', () => ({
        ScanCommand: scanCommandMock,
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
      const res = await repo.listProducts({ limit: 25 } as any);

      expect(sendMock).toHaveBeenCalledTimes(1);
      const sent = sendMock.mock.calls[0][0] as { input: any };
      expect(scanCommandMock).toHaveBeenCalledTimes(1);
      expect(sent.input.TableName).toBe('aws-crud-api-dev-products');
      expect(sent.input.Limit).toBe(25);
      expect(sent.input.ExclusiveStartKey).toBeUndefined();

      expect(res).toEqual({
        items: [
          {
            productId: 'p-1',
            name: 'A',
            price: 0,
            status: 'ACTIVE',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
          {
            productId: 'p-2',
            name: 'B',
            price: 10,
            status: 'INACTIVE',
            createdAt: '2025-01-02T00:00:00.000Z',
          },
        ],
        nextCursor: undefined,
      });

      expect(mapDynamoErrorMock).not.toHaveBeenCalled();
    });

    it('escanea con cursor (decodifica ExclusiveStartKey) y devuelve nextCursor cuando hay paginación', async () => {
      jest.resetModules();
      process.env.PRODUCTS_TABLE_NAME = 'aws-crud-api-dev-products';

      const lastKey = { productId: 'p-9' };
      const lastKeyB64 = Buffer.from(JSON.stringify(lastKey)).toString('base64');

      const sendMock = jest.fn().mockResolvedValue({
        Items: [
          {
            productId: 'p-10',
            name: 'Z',
            price: 5,
            status: 'ACTIVE',
            createdAt: '2025-01-03T00:00:00.000Z',
          },
        ],
        LastEvaluatedKey: { productId: 'p-10' },
      });
      const scanCommandMock = jest.fn().mockImplementation((input) => ({ input }));
      const mapDynamoErrorMock = jest.fn();

      jest.doMock('../../../src/infrastructure/database/DynamonDB', () => ({
        ddbDoc: { send: sendMock },
      }));
      jest.doMock('@aws-sdk/lib-dynamodb', () => ({
        ScanCommand: scanCommandMock,
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
      const res = await repo.listProducts({ limit: 10, cursor: lastKeyB64 } as any);

      const sent = (sendMock as jest.Mock).mock.calls[0][0] as { input: any };
      expect(sent.input.TableName).toBe('aws-crud-api-dev-products');
      expect(sent.input.Limit).toBe(10);
      expect(sent.input.ExclusiveStartKey).toEqual(lastKey);

      const expectedNext = Buffer.from(JSON.stringify({ productId: 'p-10' })).toString('base64');
      expect(res).toEqual({
        items: [
          {
            productId: 'p-10',
            name: 'Z',
            price: 5,
            status: 'ACTIVE',
            createdAt: '2025-01-03T00:00:00.000Z',
          },
        ],
        nextCursor: expectedNext,
      });

      expect(mapDynamoErrorMock).not.toHaveBeenCalled();
    });

    it('mapea y relanza error si ddbDoc.send falla', async () => {
      jest.resetModules();
      process.env.PRODUCTS_TABLE_NAME = 'aws-crud-api-dev-products';

      const rawError = new Error('scan failed');
      const sendMock = jest.fn().mockRejectedValue(rawError);
      const scanCommandMock = jest.fn().mockImplementation((input) => ({ input }));
      const mapped = new Error('mapped-error');
      const mapDynamoErrorMock = jest.fn().mockReturnValue(mapped);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      jest.doMock('../../../src/infrastructure/database/DynamonDB', () => ({
        ddbDoc: { send: sendMock },
      }));
      jest.doMock('@aws-sdk/lib-dynamodb', () => ({
        ScanCommand: scanCommandMock,
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

      await expect(repo.listProducts({ limit: 5 } as any)).rejects.toBe(mapped);

      expect(sendMock).toHaveBeenCalledTimes(1);
      expect(mapDynamoErrorMock).toHaveBeenCalledWith(rawError);

      consoleSpy.mockRestore();
    });
  });
});
