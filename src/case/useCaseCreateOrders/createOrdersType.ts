import { createOrdersDependencies } from './CreateOrdersDepencies';
import { createOrders } from '../../domain/models/OrdersModels';

/**
 * Tipo que define la firma del caso de uso `createOrders`.
 *
 * Representa una función asíncrona que:
 * 1. Recibe las dependencias necesarias (`createOrdersDependencies`).
 * 2. Recibe el input con la información para crear la orden (`createOrders`).
 * 3. Retorna una promesa con el resultado del proceso de creación.
 */
export type createOrderType = (
  event: createOrdersDependencies,
  input: createOrders,
) => Promise<any>;
