import { Logger } from 'winston';

import { OrdersRepository } from '../../domain/repository/ordersRepository';

/**
 * Dependencias requeridas para el caso de uso `createOrders`.
 *
 * Contiene los componentes necesarios para ejecutar la lógica
 * de creación de órdenes.
 */
export type createOrdersDependencies = {
  repository: OrdersRepository;
  logger: Logger;
};
