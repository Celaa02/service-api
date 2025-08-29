import { getByUserOrdersDependencies } from './getByUserOrdersDepencies';
import { getByUsrOrderType } from './getByUserOrdersType';
import { orderByUser } from '../../domain/models/OrdersModels';

export const useCaseGetByUserOrders =
  (): getByUsrOrderType =>
  async (dependencies: getByUserOrdersDependencies, input: orderByUser) => {
    const { repository, logger } = dependencies;
    const response = await repository.listOrdersByUser(input);
    logger.info('✅ order', response);
    return response;
  };
