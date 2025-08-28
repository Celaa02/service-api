import { productCreate } from '../../../src/domain/models/ProductsMondels';

describe('ProductRepositoryDynamoDB.createProduct', () => {
  jest.mock('../../../src/infrastructure/database/DynamonDB', () => ({
    ddbDoc: { send: jest.fn() },
  }));

  jest.mock('@aws-sdk/lib-dynamodb', () => {
    const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
    return {
      ...actual,
      ScanCommand: jest.fn().mockImplementation((input) => ({ input })),
    };
  });

  jest.mock('../../../src/utils/mapDynamonError', () => ({
    mapDynamoError: jest.fn(),
  }));
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
});

describe('ProductRepositoryDynamoDB.getProductById', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV, PRODUCTS_TABLE_NAME: 'aws-crud-api-dev-products' };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('retorna el productResponse mapeado cuando el Item existe (status por defecto ACTIVE si falta)', async () => {
    // Mocks compartidos
    const sendMock = jest.fn().mockResolvedValue({
      Item: {
        productId: 'p-1',
        name: 'Mouse',
        price: 35,
        stock: 50,
        createdAt: '2025-01-02T00:00:00.000Z',
      },
    });
    const getCommandMock = jest.fn().mockImplementation((input) => ({ input }));
    const mapDynamoErrorMock = jest.fn();

    jest.doMock('../../../src/infrastructure/database/DynamonDB', () => ({
      ddbDoc: { send: sendMock },
    }));
    jest.doMock('@aws-sdk/lib-dynamodb', () => ({
      GetCommand: getCommandMock,
      PutCommand: jest.fn().mockImplementation((input) => ({ input })),
    }));
    jest.doMock('../../../src/utils/mapDynamonError', () => ({
      mapDynamoError: mapDynamoErrorMock,
    }));

    const { ProductRepositoryDynamoDB } = await import(
      '../../../src/infrastructure/repository/productsRepository'
    );
    const repo = new ProductRepositoryDynamoDB();

    const out = await repo.getProductById('p-1');

    expect(getCommandMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledTimes(1);
    const sentCmd = sendMock.mock.calls[0][0] as { input: any };
    expect(sentCmd.input.TableName).toBe('aws-crud-api-dev-products');
    expect(sentCmd.input.Key).toEqual({ productId: 'p-1' });

    expect(out).toEqual({
      productId: 'p-1',
      name: 'Mouse',
      price: 35,
      stock: 50,
      status: 'ACTIVE',
      createdAt: '2025-01-02T00:00:00.000Z',
    });

    expect(mapDynamoErrorMock).not.toHaveBeenCalled();
  });

  it('retorna null cuando no existe Item en la respuesta', async () => {
    const sendMock = jest.fn().mockResolvedValue({});
    const getCommandMock = jest.fn().mockImplementation((input) => ({ input }));
    const mapDynamoErrorMock = jest.fn();

    jest.doMock('../../../src/infrastructure/database/DynamonDB', () => ({
      ddbDoc: { send: sendMock },
    }));
    jest.doMock('@aws-sdk/lib-dynamodb', () => ({
      GetCommand: getCommandMock,
      PutCommand: jest.fn().mockImplementation((input) => ({ input })),
    }));
    jest.doMock('../../../src/utils/mapDynamonError', () => ({
      mapDynamoError: mapDynamoErrorMock,
    }));

    const { ProductRepositoryDynamoDB } = await import(
      '../../../src/infrastructure/repository/productsRepository'
    );
    const repo = new ProductRepositoryDynamoDB();

    const out = await repo.getProductById('p-404');

    expect(sendMock).toHaveBeenCalledTimes(1);
    const sentCmd = sendMock.mock.calls[0][0] as { input: any };
    expect(sentCmd.input.TableName).toBe('aws-crud-api-dev-products');
    expect(sentCmd.input.Key).toEqual({ productId: 'p-404' });

    expect(out).toBeNull();
    expect(mapDynamoErrorMock).not.toHaveBeenCalled();
  });

  it('mapea y relanza el error si ddbDoc.send falla', async () => {
    const rawError = new Error('get failed');
    const sendMock = jest.fn().mockRejectedValue(rawError);
    const getCommandMock = jest.fn().mockImplementation((input) => ({ input }));
    const mapped = new Error('mapped-error');
    const mapDynamoErrorMock = jest.fn().mockReturnValue(mapped);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.doMock('../../../src/infrastructure/database/DynamonDB', () => ({
      ddbDoc: { send: sendMock },
    }));
    jest.doMock('@aws-sdk/lib-dynamodb', () => ({
      GetCommand: getCommandMock,
      PutCommand: jest.fn().mockImplementation((input) => ({ input })),
    }));
    jest.doMock('../../../src/utils/mapDynamonError', () => ({
      mapDynamoError: mapDynamoErrorMock,
    }));

    const { ProductRepositoryDynamoDB } = await import(
      '../../../src/infrastructure/repository/productsRepository'
    );
    const repo = new ProductRepositoryDynamoDB();

    await expect(repo.getProductById('p-err')).rejects.toBe(mapped);

    expect(sendMock).toHaveBeenCalledTimes(1);
    const sentCmd = sendMock.mock.calls[0][0] as { input: any };
    expect(sentCmd.input.TableName).toBe('aws-crud-api-dev-products');
    expect(sentCmd.input.Key).toEqual({ productId: 'p-err' });

    expect(mapDynamoErrorMock).toHaveBeenCalledWith(rawError);
    consoleSpy.mockRestore();
  });
});

describe('ProductRepositoryDynamoDB.listAll', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV, PRODUCTS_TABLE_NAME: 'aws-crud-api-dev-products' };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('escanea la tabla y devuelve Items', async () => {
    const sendMock = jest.fn().mockResolvedValue({
      Items: [
        {
          productId: 'p-1',
          name: 'Mouse',
          price: 25,
          stock: 100,
          status: 'ACTIVE',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          productId: 'p-2',
          name: 'Teclado',
          price: 120,
          stock: 50,
          status: 'ACTIVE',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ],
    });
    const scanCommandMock = jest.fn().mockImplementation((input) => ({ input }));
    const mapDynamoErrorMock = jest.fn();

    jest.doMock('../../../src/infrastructure/database/DynamonDB', () => ({
      ddbDoc: { send: sendMock },
    }));
    jest.doMock('@aws-sdk/lib-dynamodb', () => ({
      ScanCommand: scanCommandMock,
      // por si el archivo también importa otros comandos:
      PutCommand: jest.fn().mockImplementation((input) => ({ input })),
      GetCommand: jest.fn().mockImplementation((input) => ({ input })),
      UpdateCommand: jest.fn().mockImplementation((input) => ({ input })),
      QueryCommand: jest.fn().mockImplementation((input) => ({ input })),
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
    const res = await repo.listAll();

    expect(sendMock).toHaveBeenCalledTimes(1);
    const sent = sendMock.mock.calls[0][0] as { input: any };
    expect(sent.input.TableName).toBe('aws-crud-api-dev-products');

    expect(res).toEqual([
      {
        productId: 'p-1',
        name: 'Mouse',
        price: 25,
        stock: 100,
        status: 'ACTIVE',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      {
        productId: 'p-2',
        name: 'Teclado',
        price: 120,
        stock: 50,
        status: 'ACTIVE',
        createdAt: '2025-01-02T00:00:00.000Z',
      },
    ]);
    expect(mapDynamoErrorMock).not.toHaveBeenCalled();
  });

  it('devuelve [] si no hay Items', async () => {
    const sendMock = jest.fn().mockResolvedValue({});
    const scanCommandMock = jest.fn().mockImplementation((input) => ({ input }));
    const mapDynamoErrorMock = jest.fn();

    jest.doMock('../../../src/infrastructure/database/DynamonDB', () => ({
      ddbDoc: { send: sendMock },
    }));
    jest.doMock('@aws-sdk/lib-dynamodb', () => ({
      ScanCommand: scanCommandMock,
      PutCommand: jest.fn().mockImplementation((input) => ({ input })),
      GetCommand: jest.fn().mockImplementation((input) => ({ input })),
      UpdateCommand: jest.fn().mockImplementation((input) => ({ input })),
      QueryCommand: jest.fn().mockImplementation((input) => ({ input })),
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
    const res = await repo.listAll();

    expect(sendMock).toHaveBeenCalledTimes(1);
    const sent = sendMock.mock.calls[0][0] as { input: any };
    expect(sent.input.TableName).toBe('aws-crud-api-dev-products');

    expect(res).toEqual([]);
    expect(mapDynamoErrorMock).not.toHaveBeenCalled();
  });

  it('mapea y relanza el error si ddbDoc.send falla', async () => {
    const rawError = new Error('scan failed');
    const sendMock = jest.fn().mockRejectedValue(rawError);
    const scanCommandMock = jest.fn().mockImplementation((input) => ({ input }));
    const mapped = new Error('mapped-error');
    const mapDynamoErrorMock = jest.fn().mockReturnValue(mapped);

    jest.doMock('../../../src/infrastructure/database/DynamonDB', () => ({
      ddbDoc: { send: sendMock },
    }));
    jest.doMock('@aws-sdk/lib-dynamodb', () => ({
      ScanCommand: scanCommandMock,
      PutCommand: jest.fn().mockImplementation((input) => ({ input })),
      GetCommand: jest.fn().mockImplementation((input) => ({ input })),
      UpdateCommand: jest.fn().mockImplementation((input) => ({ input })),
      QueryCommand: jest.fn().mockImplementation((input) => ({ input })),
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
    await expect(repo.listAll()).rejects.toBe(mapped);

    expect(sendMock).toHaveBeenCalledTimes(1);
    const sent = sendMock.mock.calls[0][0] as { input: any };
    expect(sent.input.TableName).toBe('aws-crud-api-dev-products');
    expect(mapDynamoErrorMock).toHaveBeenCalledWith(rawError);
  });
});
