import { createOrdersDependencies } from '../../../src/domain/case/dependencies/CreateOrdersDepencies';
import { useCaseCreateOrders } from '../../../src/domain/case/useCaseCreateOrders';
import { createOrders } from '../../../src/domain/models/OrdersModelsHttp';

describe('useCaseCreateOrders', () => {
  let dependencies: createOrdersDependencies;
  const input: createOrders = {
    orderId: 'abc-123',
  } as any;

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

  it('debe llamar al repositorio con el input, loguear y devolver la respuesta del repositorio', async () => {
    const created = { orderId: 'abc-123', status: 'CREATED' };
    (dependencies.repository.createOrders as jest.Mock).mockResolvedValue(created);

    const uc = useCaseCreateOrders();
    const result = await uc(dependencies, input);

    expect(dependencies.repository.createOrders).toHaveBeenCalledTimes(1);
    expect(dependencies.repository.createOrders).toHaveBeenCalledWith(input);

    expect(dependencies.logger.info).toHaveBeenCalledWith('✅ order', created);
    expect(result).toBe(created);
  });

  it('propaga el error si el repositorio rechaza', async () => {
    const err = new Error('db fail');
    (dependencies.repository.createOrders as jest.Mock).mockRejectedValue(err);

    const uc = useCaseCreateOrders();

    await expect(uc(dependencies, input)).rejects.toThrow(err);
    expect(dependencies.repository.createOrders).toHaveBeenCalledWith(input);
    expect(dependencies.logger.info).not.toHaveBeenCalled();
  });
});
