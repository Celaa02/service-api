import { APIGatewayProxyEvent } from 'aws-lambda';

import { createOrdersDependencies } from '../../../case/useCaseCreateOrders/CreateOrdersDepencies';
import { createOrderType } from '../../../case/useCaseCreateOrders/createOrdersType';
import { createOrders } from '../../../domain/models/OrdersModels';
import { parseBody } from '../../../utils/utilsResponse';

/**
 * HTTP Adapter para el caso de uso `createOrders`.
 *
 * Este adapter traduce la entrada del evento HTTP (API Gateway)
 * al formato esperado por el caso de uso de creación de órdenes.
 *
 * Flujo:
 * 1. Registra el evento entrante en logs.
 * 2. Verifica que el `body` esté presente en la petición.
 * 3. Parsea y valida el `body` usando `parseBody`.
 * 4. Construye un objeto `createOrders` con los datos necesarios.
 * 5. Ejecuta el caso de uso con dependencias e input.
 * 6. Retorna la respuesta del caso de uso al handler.
 *
 * @param {createOrderType} doCase - Caso de uso para crear órdenes.
 * @returns {Function} - Función que recibe el evento HTTP y dependencias para ejecutar el caso de uso.
 */
export const createOrdersHttpAdapter =
  (doCase: createOrderType) =>
  async (event: APIGatewayProxyEvent, dependencies: createOrdersDependencies) => {
    dependencies.logger.info(event);
    if (!event.body) {
      throw new Error('Request body is required');
    }
    const body = parseBody<createOrders>(event);
    const input: createOrders = {
      userId: body.userId,
      items: body.items,
      total: body.total,
      status: body.status,
    };
    const response = await doCase(dependencies, input);
    return response;
  };
