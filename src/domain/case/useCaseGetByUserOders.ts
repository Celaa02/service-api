import { orderByUser } from '../models/OrdersModelsHttp';
import { getByUserOrdersDependencies } from './dependencies/getByUserOrders/getByUserOrdersDepencies';
import { getByUsrOrderType } from './dependencies/getByUserOrders/getByUserOrdersType';

export const useCaseGetByUserOrders =
  (): getByUsrOrderType =>
  async (dependencies: getByUserOrdersDependencies, input: orderByUser) => {
    const { repository, logger } = dependencies;
    const response = await repository.listOrdersByUser(input);
    logger.info('✅ order', response);
    return response;
  };
