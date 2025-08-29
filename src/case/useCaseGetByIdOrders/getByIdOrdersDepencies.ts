import { Logger } from 'winston';

import { OrdersRepository } from '../../domain/repository/ordersRepository';

export type getByIdOrdersDependencies = {
  repository: OrdersRepository;
  logger: Logger;
};
