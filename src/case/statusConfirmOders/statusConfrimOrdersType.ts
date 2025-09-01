import { statusConfirmOrdersDependencies } from './statusConfirmOrdersDepencies';
import { confirmOrder } from '../../domain/models/OrdersModels';

/**
 * Tipo que define la firma del caso de uso `statusConfirmOrders`.
 *
 * Representa una función asíncrona que:
 * 1. Recibe las dependencias necesarias (`statusConfirmOrdersDependencies`).
 * 2. Recibe el input con la información para confirmar la orden (`confirmOrder`).
 * 3. Retorna una promesa con el resultado del proceso de confirmación.
 */
export type statusConfirmOrderType = (
  event: statusConfirmOrdersDependencies,
  input: confirmOrder,
) => Promise<any>;
