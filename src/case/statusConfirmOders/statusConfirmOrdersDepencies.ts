import { Logger } from 'winston';

import { OrdersRepository } from '../../domain/repository/ordersRepository';
import { ProductsRepository } from '../../domain/repository/productsRepository';

export type statusConfirmOrdersDependencies = {
  repositoryOrders: OrdersRepository;
  repositoryProduct: ProductsRepository;
  logger: Logger;
};
