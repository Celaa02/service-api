import { itemCreateOrder } from '../../../src/domain/models/OrdersModelsHttp';
import { ddbDoc } from '../../../src/infrastructure/database/DynamonDB';
import { OrderRepositoryDynamoDB } from '../../../src/infrastructure/repository/dynamonDBRepository';
import { mapDynamoError } from '../../../src/utils/mapDynamonError';

jest.mock('../../../src/infrastructure/database/DynamonDB', () => ({
  ddbDoc: { send: jest.fn() },
}));

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    PutCommand: jest.fn().mockImplementation((input) => ({ input })),
    GetCommand: jest.fn().mockImplementation((input) => ({ input })),
  };
});

jest.mock('../../../src/utils/mapDynamonError', () => ({
  mapDynamoError: jest.fn(),
}));

describe('OrderRepositoryDynamoDB', () => {
  const ORIGINAL_ENV = { ...process.env };
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV, ORDERS_TABLE_NAME: 'aws-crud-api-dev-orders' };
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('createOrders', () => {
    it('envía PutCommand con el Item recibido y retorna el mismo order', async () => {
      const repo = new OrderRepositoryDynamoDB();
      (ddbDoc.send as jest.Mock).mockResolvedValue({});

      const order: itemCreateOrder = {
        orderId: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user-1',
        createdAt: '2025-01-01T00:00:00.000Z',
        items: [{ sku: 'A1', qty: 2 }],
        status: 'NEW',
        total: 99.5,
      } as any;

      const result = await repo.createOrders(order);

      expect(ddbDoc.send).toHaveBeenCalledTimes(1);
      const sentCmd = (ddbDoc.send as jest.Mock).mock.calls[0][0] as { input: any };

      expect(sentCmd).toBeDefined();
      expect(sentCmd.input.TableName).toBe('aws-crud-api-dev-orders');
      expect(sentCmd.input.ConditionExpression).toBe('attribute_not_exists(orderId)');
      expect(sentCmd.input.Item).toEqual(order);

      expect(result).toEqual(order);
      expect(mapDynamoError).not.toHaveBeenCalled();
    });

    it('mapea y relanza el error si ddbDoc.send falla', async () => {
      const repo = new OrderRepositoryDynamoDB();

      const rawError = new Error('boom');
      (ddbDoc.send as jest.Mock).mockRejectedValue(rawError);

      const mapped = new Error('mapped');
      (mapDynamoError as jest.Mock).mockReturnValue(mapped);

      const order: itemCreateOrder = {
        orderId: 'o-1',
        userId: 'u',
        createdAt: '2025-01-01T00:00:00.000Z',
        items: [],
        status: 'NEW',
        total: 0,
      } as any;

      await expect(repo.createOrders(order)).rejects.toBe(mapped);

      expect(ddbDoc.send).toHaveBeenCalledTimes(1);
      expect(mapDynamoError).toHaveBeenCalledWith(rawError);
    });
  });

  describe('getOrderById', () => {
    it('retorna null si no existe Item', async () => {
      const repo = new OrderRepositoryDynamoDB();

      (ddbDoc.send as jest.Mock).mockResolvedValue({ Item: undefined });

      const res = await repo.getOrderById('abc');

      // Validar que pidió por la PK correcta
      const sentCmd = (ddbDoc.send as jest.Mock).mock.calls[0][0] as { input: any };
      expect(sentCmd.input.TableName).toBe('aws-crud-api-dev-orders');
      expect(sentCmd.input.Key).toEqual({ orderId: 'abc' });

      expect(res).toBeNull();
      expect(mapDynamoError).not.toHaveBeenCalled();
    });

    it('retorna null si status !== CONFIRMED', async () => {
      const repo = new OrderRepositoryDynamoDB();

      const stored: itemCreateOrder = {
        orderId: 'abc',
        userId: 'user-1',
        createdAt: '2025-01-01T00:00:00.000Z',
        items: [{ sku: 'A1', qty: 1 }],
        status: 'NEW', // no confirmado
        total: 10,
      } as any;

      (ddbDoc.send as jest.Mock).mockResolvedValue({ Item: stored });

      const res = await repo.getOrderById('abc');

      expect(res).toBeNull();
      expect(mapDynamoError).not.toHaveBeenCalled();
    });

    it('retorna el objeto mapeado cuando el Item está CONFIRMED', async () => {
      const repo = new OrderRepositoryDynamoDB();

      const stored: itemCreateOrder = {
        orderId: 'abc',
        userId: 'user-1',
        createdAt: '2025-01-01T00:00:00.000Z',
        items: [{ sku: 'A1', qty: 1 }],
        status: 'CONFIRMED',
        total: 10,
      } as any;

      (ddbDoc.send as jest.Mock).mockResolvedValue({ Item: stored });

      const res = await repo.getOrderById('abc');

      expect(res).toEqual({
        orderId: 'abc',
        userId: 'user-1',
        items: [{ sku: 'A1', qty: 1 }],
        total: 10,
        createdAt: '2025-01-01T00:00:00.000Z',
        status: 'CONFIRMED',
      });
      expect(mapDynamoError).not.toHaveBeenCalled();
    });

    it('mapea y relanza el error cuando el Get falla', async () => {
      const repo = new OrderRepositoryDynamoDB();

      const rawError = new Error('get failed');
      (ddbDoc.send as jest.Mock).mockRejectedValue(rawError);

      const mapped = new Error('mapped-get');
      (mapDynamoError as jest.Mock).mockReturnValue(mapped);

      await expect(repo.getOrderById('abc')).rejects.toBe(mapped);

      expect(ddbDoc.send).toHaveBeenCalledTimes(1);
      expect(mapDynamoError).toHaveBeenCalledWith(rawError);
    });
  });
});
