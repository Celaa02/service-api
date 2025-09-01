import { Logger } from 'winston';

import { OrdersRepository } from '../../domain/repository/ordersRepository';
import { ProductsRepository } from '../../domain/repository/productsRepository';

/**
 * Dependencias requeridas para el caso de uso `statusConfirmOrders`.
 *
 * Contiene los repositorios y utilidades necesarias para ejecutar
 * la lógica de confirmación de órdenes.
 */
export type statusConfirmOrdersDependencies = {
  repositoryOrders: OrdersRepository;
  repositoryProduct: ProductsRepository;
  logger: Logger;
};
