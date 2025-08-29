import { getByIdOrdersDependencies } from '../../src/case/useCaseGetByIdOrders/getByIdOrdersDepencies';
import { useCaseGetByIdOrders } from '../../src/case/useCaseGetByIdOrders/useCaseGetByIdOrders';
import { orderById } from '../../src/domain/models/OrdersModels';

describe('useCaseGetByIdOrders', () => {
  let dependencies: getByIdOrdersDependencies;

  const input: orderById = {
    orderId: '123e4567-e89b-12d3-a456-426614174000',
  } as any;

  beforeEach(() => {
    const repository = {
      getOrderById: jest.fn(),
    };
    const logger = {
      info: jest.fn(),
    };

    dependencies = {
      repository: repository as any,
      logger: logger as any,
    } as unknown as getByIdOrdersDependencies;

    jest.clearAllMocks();
  });

  it('debe llamar al repositorio con el orderId, loguear y devolver la respuesta', async () => {
    const found = {
      orderId: input.orderId,
      userId: 'user-1',
      items: [{ sku: 'A1', qty: 2 }],
      status: 'NEW',
      total: 99.5,
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    (dependencies.repository.getOrderById as jest.Mock).mockResolvedValue(found);

    const uc = useCaseGetByIdOrders();
    const result = await uc(dependencies, input);

    expect(dependencies.repository.getOrderById).toHaveBeenCalledTimes(1);
    expect(dependencies.repository.getOrderById).toHaveBeenCalledWith(input.orderId);

    expect(dependencies.logger.info).toHaveBeenCalledWith('✅ order', found);
    expect(result).toBe(found);
  });

  it('propaga el error si el repositorio rechaza y no loguea éxito', async () => {
    const err = new Error('db fail');
    (dependencies.repository.getOrderById as jest.Mock).mockRejectedValue(err);

    const uc = useCaseGetByIdOrders();

    await expect(uc(dependencies, input)).rejects.toThrow(err);
    expect(dependencies.repository.getOrderById).toHaveBeenCalledWith(input.orderId);
    expect(dependencies.logger.info).not.toHaveBeenCalled();
  });
});
