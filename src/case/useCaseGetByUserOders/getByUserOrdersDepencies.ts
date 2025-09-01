import { Logger } from 'winston';

import { OrdersRepository } from '../../domain/repository/ordersRepository';

/**
 * Dependencias requeridas para el caso de uso `getByUserOrders`.
 *
 * Contiene los componentes necesarios para ejecutar la lógica
 * de obtención de órdenes por usuario.
 */
export type getByUserOrdersDependencies = {
  repository: OrdersRepository;
  logger: Logger;
};
