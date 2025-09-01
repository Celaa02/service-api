import { APIGatewayProxyEvent } from 'aws-lambda';

import { getByUserOrdersDependencies } from '../../../case/useCaseGetByUserOders/getByUserOrdersDepencies';
import { getByUsrOrderType } from '../../../case/useCaseGetByUserOders/getByUserOrdersType';

/**
 * HTTP Adapter para el caso de uso `getByUserOrders`.
 *
 * Este adapter traduce la entrada del evento HTTP (API Gateway)
 * al formato esperado por el caso de uso de obtención de órdenes por usuario.
 *
 * Flujo:
 * 1. Registra el evento entrante en logs.
 * 2. Obtiene `userId` desde `pathParameters` y `limit` desde `queryStringParameters`.
 * 3. Si alguno de los dos falta, lanza un error.
 * 4. Ejecuta el caso de uso con las dependencias inyectadas.
 * 5. Retorna la respuesta del caso de uso al handler.
 *
 * @param {getByUsrOrderType} doCase - Caso de uso para obtener órdenes por usuario.
 * @returns {Function} - Función que recibe el evento HTTP y dependencias para ejecutar el caso de uso.
 */
export const getByUserOrdersHttpAdapter =
  (doCase: getByUsrOrderType) =>
  async (event: APIGatewayProxyEvent, dependencies: getByUserOrdersDependencies) => {
    dependencies.logger.info(event);
    const id = event.pathParameters?.userId;
    const limit = event.queryStringParameters?.limit;

    if (!id || !limit) {
      throw new Error('Request pathParametersor or queryStringParameters is required');
    }
    const response = await doCase(dependencies, {
      userId: id,
      limit: Number(limit),
    });
    return response;
  };
