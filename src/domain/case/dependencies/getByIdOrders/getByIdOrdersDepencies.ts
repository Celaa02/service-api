import { Logger } from 'winston';

import { OrdersRepository } from '../../../repository/ordersRepository';

export type getByIdOrdersDependencies = {
  repository: OrdersRepository;
  logger: Logger;
};
