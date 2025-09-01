import { statusConfirmOrdersDependencies } from './statusConfirmOrdersDepencies';
import { statusConfirmOrderType } from './statusConfrimOrdersType';
import { confirmOrder } from '../../domain/models/OrdersModels';

/**
 * Caso de uso: Confirmar una orden.
 *
 * Este caso de uso se encarga de:
 * 1. Confirmar una orden a través del repositorio de órdenes (`repositoryOrders`).
 * 2. Si la orden tiene productos asociados, decrementa el stock de cada uno
 *    utilizando el repositorio de productos (`repositoryProduct`).
 * 3. Registra en logs el resultado.
 * 4. Retorna la orden confirmada.
 *
 * @returns {statusConfirmOrderType} - Función asíncrona que recibe dependencias y un input `confirmOrder`.
 */
export const statusConfirmOders =
  (): statusConfirmOrderType =>
  async (dependencies: statusConfirmOrdersDependencies, input: confirmOrder) => {
    const { repositoryOrders, repositoryProduct, logger } = dependencies;
    const response = await repositoryOrders.confirmOrder(input);
    if (response?.items) {
      await repositoryProduct.decrementStockForOrderItems(response.items);
    }
    logger.info('✅ order', response);
    return response;
  };
