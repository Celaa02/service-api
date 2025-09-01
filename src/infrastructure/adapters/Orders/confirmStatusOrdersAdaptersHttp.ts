import { APIGatewayProxyEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';

import { statusConfirmOrdersDependencies } from '../../../case/statusConfirmOders/statusConfirmOrdersDepencies';
import { statusConfirmOrderType } from '../../../case/statusConfirmOders/statusConfrimOrdersType';

/**
 * HTTP Adapter para el caso de uso `statusConfirmOrders`.
 *
 * Este adapter traduce la entrada del evento HTTP (API Gateway)
 * al formato esperado por el caso de uso de confirmación de órdenes.
 *
 * Flujo:
 * 1. Registra el evento entrante en logs.
 * 2. Obtiene el parámetro `orderId` desde `pathParameters`.
 * 3. Si no existe `orderId`, lanza un error.
 * 4. Genera un `paymentId` aleatorio (UUID).
 * 5. Ejecuta el caso de uso con las dependencias inyectadas.
 * 6. Retorna la respuesta del caso de uso al handler.
 *
 * @param {statusConfirmOrderType} doCase - Caso de uso para confirmar órdenes.
 * @returns {Function} - Función que recibe el evento HTTP y dependencias para ejecutar el caso de uso.
 */
export const confirmStatusOrdersHttpAdapter =
  (doCase: statusConfirmOrderType) =>
  async (event: APIGatewayProxyEvent, dependencies: statusConfirmOrdersDependencies) => {
    dependencies.logger.info(event);
    const id = event.pathParameters?.orderId;

    if (!id) {
      throw new Error('Request pathParametersor is required');
    }
    const response = await doCase(dependencies, {
      orderId: id,
      paymentId: randomUUID(),
    });
    return response;
  };
