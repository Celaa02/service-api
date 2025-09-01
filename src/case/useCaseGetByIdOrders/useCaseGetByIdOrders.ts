import { getByIdOrdersDependencies } from './getByIdOrdersDepencies';
import { getByIdOrderType } from './getByIdOrdersType';
import { orderById } from '../../domain/models/OrdersModels';

/**
 * Caso de uso: Obtener una orden por su ID.
 *
 * Este caso de uso se encarga de:
 * 1. Recibir el `orderId` como input.
 * 2. Consultar el repositorio de órdenes para obtener la orden asociada.
 * 3. Registrar en logs el resultado de la operación.
 * 4. Retornar la orden encontrada o `null` si no existe.
 *
 * @returns {getByIdOrderType} - Función que recibe dependencias e input `orderById`.
 */
export const useCaseGetByIdOrders =
  (): getByIdOrderType => async (dependencies: getByIdOrdersDependencies, input: orderById) => {
    const { repository, logger } = dependencies;
    const response = await repository.getOrderById(input.orderId);
    logger.info('✅ order', response);
    return response;
  };
