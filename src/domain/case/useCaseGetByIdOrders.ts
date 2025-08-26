import { orderById } from '../models/OrdersModelsHttp';
import { getByIdOrdersDependencies } from './dependencies/getByIdOrders/getByIdOrdersDepencies';
import { getByIdOrderType } from './dependencies/getByIdOrders/getByIdOrdersType';

export const useCaseGetByIdOrders =
  (): getByIdOrderType => async (dependencies: getByIdOrdersDependencies, input: orderById) => {
    const { repository, logger } = dependencies;
    const response = await repository.getOrderById(input.orderId);
    logger.info('✅ order', response);
    return response;
  };
