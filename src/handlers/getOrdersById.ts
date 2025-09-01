import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getByIdOrdersHttpAdapter } from '../infrastructure/adapters/Orders/getByIdOrdersAdaptersHttp';
import { OrderRepositoryDynamoDB } from '../infrastructure/repository/ordersRepository';
import { _200_OK_, _404_NOT_FOUND_ } from '../utils/HttpResponse';
import { toHttpResponse } from '../utils/HttpResponseErrors';
import { logger } from '../utils/Logger';
import { validationHttps } from '../utils/ValidationsHttps';
import { pathSchema } from './schemas/Orders/getByIdOrdersSchemaHttp';
import { getByIdOrdersDependencies } from '../case/useCaseGetByIdOrders/getByIdOrdersDepencies';
import { useCaseGetByIdOrders } from '../case/useCaseGetByIdOrders/useCaseGetByIdOrders';

/**
 * Factoría para inyectar dependencias necesarias en el caso de uso `getByIdOrders`.
 *
 * @returns {getByIdOrdersDependencies} - Repositorio de órdenes y logger configurados.
 */
const factory = (): getByIdOrdersDependencies => ({
  repository: new OrderRepositoryDynamoDB(),
  logger,
});

/**
 * Lambda handler para el endpoint **GET /orders/{id}**.
 *
 * Flujo principal:
 * 1. Registra la petición entrante en logs.
 * 2. Valida los parámetros de la ruta (`pathSchema`).
 * 3. Adapta el caso de uso `useCaseGetByIdOrders` al formato HTTP.
 * 4. Ejecuta la lógica de negocio para obtener una orden por su ID.
 * 5. Si no se encuentra la orden, retorna HTTP 404 con un mensaje descriptivo.
 * 6. Si existe, retorna HTTP 200 con la orden encontrada.
 * 7. Maneja errores y los transforma en respuestas HTTP consistentes.
 *
 * @param {APIGatewayProxyEvent} event - Evento recibido desde API Gateway con el request.
 * @returns {Promise<APIGatewayProxyResult>} - Respuesta HTTP (200 si la orden existe, 404 si no, error en caso contrario).
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const dependencies = factory();
  dependencies.logger.info('📥 Incoming request', { event });

  try {
    const validated = await validationHttps(event, { pathSchema });
    logger.debug('✅ Validation passed', validated);
    const adapter = getByIdOrdersHttpAdapter(useCaseGetByIdOrders());

    const response = await adapter(event, dependencies);
    logger.info('✅ Get order', response);

    if (response === null) {
      return _404_NOT_FOUND_({
        message: 'The orderId does not exist or is not confirmed.',
        data: [],
      });
    }
    return _200_OK_(response);
  } catch (err) {
    logger.error('❌ Error in get order', { err });
    return toHttpResponse(err);
  }
};
