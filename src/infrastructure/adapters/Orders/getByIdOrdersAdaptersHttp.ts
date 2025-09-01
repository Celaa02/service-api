import { APIGatewayProxyEvent } from 'aws-lambda';

import { getByIdOrdersDependencies } from '../../../case/useCaseGetByIdOrders/getByIdOrdersDepencies';
import { getByIdOrderType } from '../../../case/useCaseGetByIdOrders/getByIdOrdersType';

/**
 * HTTP Adapter para el caso de uso `getByIdOrders`.
 *
 * Este adapter traduce la entrada del evento HTTP (API Gateway)
 * al formato esperado por el caso de uso de obtención de una orden por ID.
 *
 * Flujo:
 * 1. Registra el evento entrante en logs.
 * 2. Obtiene el parámetro `id` desde `pathParameters`.
 * 3. Si no existe `id`, lanza un error.
 * 4. Ejecuta el caso de uso con las dependencias inyectadas y el `orderId`.
 * 5. Retorna la respuesta del caso de uso al handler.
 *
 * @param {getByIdOrderType} doCase - Caso de uso para obtener una orden por ID.
 * @returns {Function} - Función que recibe el evento HTTP y dependencias para ejecutar el caso de uso.
 */
export const getByIdOrdersHttpAdapter =
  (doCase: getByIdOrderType) =>
  async (event: APIGatewayProxyEvent, dependencies: getByIdOrdersDependencies) => {
    dependencies.logger.info(event);
    const id = event.pathParameters?.id;

    if (!id) {
      throw new Error('Request pathParameters is required');
    }
    const response = await doCase(dependencies, {
      orderId: id,
    });
    return response;
  };
