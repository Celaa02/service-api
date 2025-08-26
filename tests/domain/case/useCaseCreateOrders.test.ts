import * as crypto from 'crypto';

import { createOrdersDependencies } from '../../../src/domain/case/dependencies/CreateOrdersDepencies';
import { useCaseCreateOrders } from '../../../src/domain/case/useCaseCreateOrders';
import { createOrders } from '../../../src/domain/models/OrdersModelsHttp';

jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto');
  return {
    ...actual,
    randomUUID: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
  };
});

describe('useCaseCreateOrders', () => {
  let dependencies: createOrdersDependencies;

  const input: createOrders = {
    userId: 'user-1',
    items: [{ sku: 'A1', qty: 2 }],
    status: 'NEW',
    total: 99.5,
  } as any;

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
  });

  beforeEach(() => {
    const repository = {
      createOrders: jest.fn(),
    };
    const logger = {
      info: jest.fn(),
    };

    dependencies = {
      repository: repository as any,
      logger: logger as any,
    } as unknown as createOrdersDependencies;

    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('debe construir el item, llamar al repositorio con ese item, loguear y devolver la respuesta', async () => {
    const created = { orderId: '123e4567-e89b-12d3-a456-426614174000', status: 'CREATED' };
    (dependencies.repository.createOrders as jest.Mock).mockResolvedValue(created);

    const uc = useCaseCreateOrders();
    const result = await uc(dependencies, input);

    expect(crypto.randomUUID as jest.Mock).toHaveBeenCalledTimes(1);

    const expectedItem = {
      orderId: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-1',
      createdAt: '2025-01-01T00:00:00.000Z',
      items: [{ sku: 'A1', qty: 2 }],
      status: 'NEW',
      total: 99.5,
    };

    expect(dependencies.repository.createOrders).toHaveBeenCalledTimes(1);
    expect(dependencies.repository.createOrders).toHaveBeenCalledWith(expectedItem);

    expect(dependencies.logger.info).toHaveBeenCalledWith('✅ order', created);
    expect(result).toBe(created);
  });

  it('propaga el error si el repositorio rechaza y no loguea éxito', async () => {
    const err = new Error('db fail');
    (dependencies.repository.createOrders as jest.Mock).mockRejectedValue(err);

    const uc = useCaseCreateOrders();

    const expectedItem = {
      orderId: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-1',
      createdAt: '2025-01-01T00:00:00.000Z',
      items: [{ sku: 'A1', qty: 2 }],
      status: 'NEW',
      total: 99.5,
    };

    await expect(uc(dependencies, input)).rejects.toThrow(err);
    expect(dependencies.repository.createOrders).toHaveBeenCalledWith(expectedItem);
    expect(dependencies.logger.info).not.toHaveBeenCalled();
  });
});
