import { statusConfirmOders } from '../../src/case/statusConfirmOders/statusConfirmOders';
import { statusConfirmOrdersDependencies } from '../../src/case/statusConfirmOders/statusConfirmOrdersDepencies';
import { confirmOrder } from '../../src/domain/models/OrdersModels';

describe('statusConfirmOders use case', () => {
  let dependencies: statusConfirmOrdersDependencies;

  beforeEach(() => {
    dependencies = {
      repositoryOrders: {
        confirmOrder: jest.fn(),
      },
      repositoryProduct: {
        decrementStockForOrderItems: jest.fn(),
      },
      logger: {
        info: jest.fn(),
      },
    } as unknown as statusConfirmOrdersDependencies;

    jest.clearAllMocks();
  });

  it('debe confirmar la orden y decrementar stock cuando hay items', async () => {
    const input: confirmOrder = { orderId: 'o-1', paymentId: 'pay-1' } as any;

    const confirmed = {
      orderId: 'o-1',
      userId: 'u-1',
      items: [
        { sku: 'A1', qty: 2 },
        { sku: 'B2', qty: 1 },
      ],
      status: 'CONFIRMED',
      total: 100,
      paymentId: 'pay-1',
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    (dependencies.repositoryOrders.confirmOrder as jest.Mock).mockResolvedValue(confirmed);

    const usecase = statusConfirmOders();
    const result = await usecase(dependencies, input);

    expect(dependencies.repositoryOrders.confirmOrder).toHaveBeenCalledTimes(1);
    expect(dependencies.repositoryOrders.confirmOrder).toHaveBeenCalledWith(input);

    expect(dependencies.repositoryProduct.decrementStockForOrderItems).toHaveBeenCalledTimes(1);
    expect(dependencies.repositoryProduct.decrementStockForOrderItems).toHaveBeenCalledWith(
      confirmed.items,
    );

    expect(dependencies.logger.info).toHaveBeenCalledWith('✅ order', confirmed);
    expect(result).toBe(confirmed);
  });

  it('no debe decrementar stock cuando la respuesta es null', async () => {
    const input: confirmOrder = { orderId: 'o-404', paymentId: 'pay-x' } as any;

    (dependencies.repositoryOrders.confirmOrder as jest.Mock).mockResolvedValue(null);

    const usecase = statusConfirmOders();
    const result = await usecase(dependencies, input);

    expect(dependencies.repositoryOrders.confirmOrder).toHaveBeenCalledWith(input);
    expect(dependencies.repositoryProduct.decrementStockForOrderItems).not.toHaveBeenCalled();
    expect(dependencies.logger.info).toHaveBeenCalledWith('✅ order', null);
    expect(result).toBeNull();
  });

  it('no debe decrementar stock cuando la respuesta no trae items', async () => {
    const input: confirmOrder = { orderId: 'o-2', paymentId: 'pay-2' } as any;

    const confirmedSinItems = {
      orderId: 'o-2',
      userId: 'u-2',
      status: 'CONFIRMED',
      total: 55,
      paymentId: 'pay-2',
      createdAt: '2025-01-02T00:00:00.000Z',
      // sin items
    };

    (dependencies.repositoryOrders.confirmOrder as jest.Mock).mockResolvedValue(confirmedSinItems);

    const usecase = statusConfirmOders();
    const result = await usecase(dependencies, input);

    expect(dependencies.repositoryOrders.confirmOrder).toHaveBeenCalledWith(input);
    expect(dependencies.repositoryProduct.decrementStockForOrderItems).not.toHaveBeenCalled();
    expect(dependencies.logger.info).toHaveBeenCalledWith('✅ order', confirmedSinItems);
    expect(result).toBe(confirmedSinItems);
  });

  it('propaga el error si confirmOrder rechaza y no llama a decrement ni logger', async () => {
    const input: confirmOrder = { orderId: 'o-err', paymentId: 'pay-err' } as any;
    const err = new Error('db fail');

    (dependencies.repositoryOrders.confirmOrder as jest.Mock).mockRejectedValue(err);

    const usecase = statusConfirmOders();

    await expect(usecase(dependencies, input)).rejects.toThrow(err);

    expect(dependencies.repositoryOrders.confirmOrder).toHaveBeenCalledWith(input);
    expect(dependencies.repositoryProduct.decrementStockForOrderItems).not.toHaveBeenCalled();
    expect(dependencies.logger.info).not.toHaveBeenCalled();
  });
});
