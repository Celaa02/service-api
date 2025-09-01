import { getByIdOrdersDependencies } from './getByIdOrdersDepencies';
import { orderById } from '../../domain/models/OrdersModels';

/**
 * Tipo que define la firma del caso de uso `getByIdOrders`.
 *
 * Representa una función asíncrona que:
 * 1. Recibe las dependencias necesarias (`getByIdOrdersDependencies`).
 * 2. Recibe el input con la información para buscar una orden (`orderById`).
 * 3. Retorna una promesa con la orden encontrada o `null` si no existe.
 */
export type getByIdOrderType = (event: getByIdOrdersDependencies, input: orderById) => Promise<any>;
