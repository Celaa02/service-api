import { Logger } from 'winston';

import { OrdersRepository } from '../../domain/repository/ordersRepository';

export type statusConfirmOrdersDependencies = {
  repository: OrdersRepository;
  logger: Logger;
};
