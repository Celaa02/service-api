import { randomUUID } from 'crypto';

import { createOrdersDependencies } from './CreateOrdersDepencies';
import { createOrderType } from './createOrdersType';
import { createOrders } from '../../domain/models/OrdersModels';

/**
 * Caso de uso: Crear una orden.
 *
 * Este caso de uso se encarga de:
 * 1. Generar un `orderId` único con `UUID`.
 * 2. Construir el objeto de orden con los datos recibidos y la fecha actual.
 * 3. Guardar la orden en el repositorio.
 * 4. Registrar en logs el resultado.
 * 5. Retornar la orden creada.
 *
 * @returns {createOrderType} - Función que recibe dependencias e input `createOrders`.
 */
export const useCaseCreateOrders =
  (): createOrderType => async (dependencies: createOrdersDependencies, input: createOrders) => {
    const { repository, logger } = dependencies;

    const now = new Date().toISOString();
    const item = {
      orderId: randomUUID(),
      userId: input.userId,
      createdAt: now,
      items: input.items,
      status: input.status,
      total: input.total,
    };

    const response = await repository.createOrders(item);
    logger.info('✅ order', response);
    return response;
  };
