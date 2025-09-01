import { getByUserOrdersDependencies } from './getByUserOrdersDepencies';
import { orderByUser } from '../../domain/models/OrdersModels';

/**
 * Tipo que define la firma del caso de uso `getByUserOrders`.
 *
 * Representa una función asíncrona que:
 * 1. Recibe las dependencias necesarias (`getByUserOrdersDependencies`).
 * 2. Recibe el input con los parámetros de búsqueda (`orderByUser`),
 *    que puede incluir `userId`, `limit` y `cursor` para paginación.
 * 3. Retorna una promesa con la lista de órdenes del usuario,
 *    posiblemente con soporte de paginación.
 */
export type getByUsrOrderType = (
  event: getByUserOrdersDependencies,
  input: orderByUser,
) => Promise<any>;
