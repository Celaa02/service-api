import { statusConfirmOrdersDependencies } from './statusConfirmOrdersDepencies';
import { statusConfirmOrderType } from './statusConfrimOrdersType';
import { confirmOrder } from '../../domain/models/OrdersModels';

export const statusConfirmOders =
  (): statusConfirmOrderType =>
  async (dependencies: statusConfirmOrdersDependencies, input: confirmOrder) => {
    const { repositoryOrders, repositoryProduct, logger } = dependencies;
    const response = await repositoryOrders.confirmOrder(input);
    if (response?.items) {
      await repositoryProduct.decrementStockForOrderItems(response.items);
    }
    logger.info('✅ order', response);
    return response;
  };
