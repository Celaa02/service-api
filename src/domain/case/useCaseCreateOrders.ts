import { createOrdersDependencies } from './dependencies/CreateOrdersDepencies';
import { createOrders } from '../models/OrdersModelsHttp';
import { createOrderType } from './dependencies/createOrdersType';

export const useCaseCreateOrders =
  (): createOrderType => async (dependencies: createOrdersDependencies, input: createOrders) => {
    const { repository, logger } = dependencies;
    const response = await repository.createOrders(input);
    logger.info('✅ order', response);
    return response;
  };
