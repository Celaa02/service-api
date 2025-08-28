import { statusConfirmOders } from '../../src/case/statusConfirmOders/statusConfirmOders';
import { statusConfirmOrdersDependencies } from '../../src/case/statusConfirmOders/statusConfirmOrdersDepencies';
import { confirmOrder } from '../../src/domain/models/OrdersModels';

describe('statusConfirmOders use case', () => {
  let dependencies: statusConfirmOrdersDependencies;

  const input: confirmOrder = {
    orderId: '123e4567-e89b-12d3-a456-426614174000',
    userId: 'user-1',
  } as any;

  beforeEach(() => {
    const repository = {
      confirmOrder: jest.fn(),
    };
    const logger = {
      info: jest.fn(),
    };

    dependencies = {
      repository: repository as any,
      logger: logger as any,
    } as statusConfirmOrdersDependencies;

    jest.clearAllMocks();
  });

  it('debe invocar repository.confirmOrder con el input, loguear y devolver la respuesta', async () => {
    const repoResponse = { orderId: input.orderId, status: 'CONFIRMED' };
    (dependencies.repository.confirmOrder as jest.Mock).mockResolvedValue(repoResponse);

    const uc = statusConfirmOders();
    const result = await uc(dependencies, input);

    expect(dependencies.repository.confirmOrder).toHaveBeenCalledTimes(1);
    expect(dependencies.repository.confirmOrder).toHaveBeenCalledWith(input);

    expect(dependencies.logger.info).toHaveBeenCalledWith('✅ order', repoResponse);
    expect(result).toBe(repoResponse);
  });

  it('propaga el error si repository.confirmOrder rechaza y no loguea éxito', async () => {
    const err = new Error('db fail');
    (dependencies.repository.confirmOrder as jest.Mock).mockRejectedValue(err);

    const uc = statusConfirmOders();

    await expect(uc(dependencies, input)).rejects.toThrow(err);

    expect(dependencies.repository.confirmOrder).toHaveBeenCalledWith(input);
    expect(dependencies.logger.info).not.toHaveBeenCalled();
  });
});
