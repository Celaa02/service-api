import { confirmOrder } from '../models/OrdersModelsHttp';
import { statusConfirmOrdersDependencies } from './dependencies/statusConfirmOrders/statusConfirmOrdersDepencies';
import { statusConfirmOrderType } from './dependencies/statusConfirmOrders/statusConfrimOrdersType';

export const statusConfirmOders =
  (): statusConfirmOrderType =>
  async (dependencies: statusConfirmOrdersDependencies, input: confirmOrder) => {
    const { repository, logger } = dependencies;
    const response = await repository.confirmOrder(input);
    logger.info('✅ order', response);
    return response;
  };
