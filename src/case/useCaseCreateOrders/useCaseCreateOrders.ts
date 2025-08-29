import { randomUUID } from 'crypto';

import { createOrdersDependencies } from './CreateOrdersDepencies';
import { createOrderType } from './createOrdersType';
import { createOrders } from '../../domain/models/OrdersModels';

export const useCaseCreateOrders =
  (): createOrderType => async (dependencies: createOrdersDependencies, input: createOrders) => {
    const { repository, logger } = dependencies;

    const now = new Date().toISOString();
    const item = {
      orderId: randomUUID(),
      userId: input.userId,
      createdAt: now,
      items: input.items,
      status: input.status,
      total: input.total,
    };

    const response = await repository.createOrders(item);
    logger.info('✅ order', response);
    return response;
  };
