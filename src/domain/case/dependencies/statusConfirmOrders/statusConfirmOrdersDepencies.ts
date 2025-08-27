import { Logger } from 'winston';

import { OrdersRepository } from '../../../repository/ordersRepository';

export type statusConfirmOrdersDependencies = {
  repository: OrdersRepository;
  logger: Logger;
};
