import { Logger } from 'winston';

import { OrdersRepository } from '../../domain/repository/ordersRepository';

export type getByUserOrdersDependencies = {
  repository: OrdersRepository;
  logger: Logger;
};
