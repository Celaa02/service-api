import { getByUserOrdersDependencies } from './getByUserOrdersDepencies';
import { getByUsrOrderType } from './getByUserOrdersType';
import { orderByUser } from '../../domain/models/OrdersModels';

/**
 * Caso de uso: Obtener órdenes de un usuario.
 *
 * Este caso de uso se encarga de:
 * 1. Recibir los parámetros para filtrar órdenes de un usuario (`orderByUser`).
 * 2. Consultar el repositorio para listar las órdenes del usuario.
 * 3. Registrar en logs el resultado de la operación.
 * 4. Retornar la lista de órdenes encontradas (puede incluir paginación).
 *
 * @returns {getByUsrOrderType} - Función que recibe dependencias e input `orderByUser`.
 */
export const useCaseGetByUserOrders =
  (): getByUsrOrderType =>
  async (dependencies: getByUserOrdersDependencies, input: orderByUser) => {
    const { repository, logger } = dependencies;
    const response = await repository.listOrdersByUser(input);
    logger.info('✅ order', response);
    return response;
  };
