import { Logger } from 'winston';

import { OrdersRepository } from '../../domain/repository/ordersRepository';

/**
 * Dependencias requeridas para el caso de uso `getByIdOrders`.
 *
 * Contiene los componentes necesarios para ejecutar la lógica
 * de obtención de una orden por su ID.
 */
export type getByIdOrdersDependencies = {
  repository: OrdersRepository;
  logger: Logger;
};
