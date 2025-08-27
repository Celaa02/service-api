import { Logger } from 'winston';

import { OrdersRepository } from '../../domain/repository/ordersRepository';

export type createOrdersDependencies = {
  repository: OrdersRepository;
  logger: Logger;
};
