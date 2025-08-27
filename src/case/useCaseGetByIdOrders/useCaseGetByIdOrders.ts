import { getByIdOrdersDependencies } from './getByIdOrdersDepencies';
import { getByIdOrderType } from './getByIdOrdersType';
import { orderById } from '../../domain/models/OrdersModels';

export const useCaseGetByIdOrders =
  (): getByIdOrderType => async (dependencies: getByIdOrdersDependencies, input: orderById) => {
    const { repository, logger } = dependencies;
    const response = await repository.getOrderById(input.orderId);
    logger.info('✅ order', response);
    return response;
  };
