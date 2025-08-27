import { getByUserOrdersDependencies } from '../../../src/domain/case/dependencies/getByUserOrders/getByUserOrdersDepencies';
import { useCaseGetByUserOrders } from '../../../src/domain/case/useCaseGetByUserOders';
import { orderByUser } from '../../../src/domain/models/OrdersModelsHttp';

describe('useCaseGetByUserOrders', () => {
  let dependencies: getByUserOrdersDependencies;
  const input: orderByUser = {
    userId: 'user-1',
    limit: 10,
    cursor: undefined,
  };

  beforeEach(() => {
    const repository = {
      listOrdersByUser: jest.fn(),
    };
    const logger = {
      info: jest.fn(),
    };

    dependencies = {
      repository: repository as any,
      logger: logger as any,
    } as getByUserOrdersDependencies;

    jest.clearAllMocks();
  });

  it('debe llamar al repositorio con el input, loguear y devolver la respuesta', async () => {
    const repoResponse = { items: [{ id: 'o1', total: 100 }], nextCursor: undefined };
    (dependencies.repository.listOrdersByUser as jest.Mock).mockResolvedValue(repoResponse);

    const uc = useCaseGetByUserOrders();
    const result = await uc(dependencies, input);

    expect(dependencies.repository.listOrdersByUser).toHaveBeenCalledTimes(1);
    expect(dependencies.repository.listOrdersByUser).toHaveBeenCalledWith(input);

    expect(dependencies.logger.info).toHaveBeenCalledWith('✅ order', repoResponse);
    expect(result).toBe(repoResponse);
  });

  it('propaga el error si el repositorio rechaza', async () => {
    const err = new Error('db fail');
    (dependencies.repository.listOrdersByUser as jest.Mock).mockRejectedValue(err);

    const uc = useCaseGetByUserOrders();

    await expect(uc(dependencies, input)).rejects.toThrow(err);

    expect(dependencies.repository.listOrdersByUser).toHaveBeenCalledWith(input);
    expect(dependencies.logger.info).not.toHaveBeenCalled();
  });
});
