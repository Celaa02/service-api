import { Logger } from 'winston';

import { OrdersRepository } from '../../../repository/ordersRepository';

export type getByUserOrdersDependencies = {
  repository: OrdersRepository;
  logger: Logger;
};
