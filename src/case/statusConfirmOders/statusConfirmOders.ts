import { statusConfirmOrdersDependencies } from './statusConfirmOrdersDepencies';
import { statusConfirmOrderType } from './statusConfrimOrdersType';
import { confirmOrder } from '../../domain/models/OrdersModels';

export const statusConfirmOders =
  (): statusConfirmOrderType =>
  async (dependencies: statusConfirmOrdersDependencies, input: confirmOrder) => {
    const { repository, logger } = dependencies;
    const response = await repository.confirmOrder(input);
    logger.info('✅ order', response);
    return response;
  };
