import { Logger } from 'winston';

import { OrdersRepository } from '../../../repository/ordersRepository';

export type createOrdersDependencies = {
  repository: OrdersRepository;
  logger: Logger;
};
