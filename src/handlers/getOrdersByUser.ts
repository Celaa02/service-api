import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getByUserOrdersHttpAdapter } from '../infrastructure/adapters/Orders/getByUserOrdersAdaptersHttp';
import { OrderRepositoryDynamoDB } from '../infrastructure/repository/ordersRepository';
import { _200_OK_ } from '../utils/HttpResponse';
import { toHttpResponse } from '../utils/HttpResponseErrors';
import { logger } from '../utils/Logger';
import { validationHttps } from '../utils/ValidationsHttps';
import { pathSchema, querySchema } from './schemas/Orders/getByUserOrdersSchemaHttp';
import { getByUserOrdersDependencies } from '../case/useCaseGetByUserOders/getByUserOrdersDepencies';
import { useCaseGetByUserOrders } from '../case/useCaseGetByUserOders/useCaseGetByUserOders';

/**
 * Factoría para inyectar dependencias necesarias en el caso de uso `getByUserOrders`.
 *
 * @returns {getByUserOrdersDependencies} - Repositorio de órdenes y logger configurados.
 */
const factory = (): getByUserOrdersDependencies => ({
  repository: new OrderRepositoryDynamoDB(),
  logger,
});

/**
 * Lambda handler para el endpoint **GET /users/{userId}/orders**.
 *
 * Flujo principal:
 * 1. Registra la petición entrante en logs.
 * 2. Valida parámetros de ruta (`pathSchema`) y de query (`querySchema`).
 * 3. Adapta el caso de uso `useCaseGetByUserOrders` al formato HTTP.
 * 4. Ejecuta la lógica de negocio para obtener órdenes de un usuario.
 * 5. Retorna una respuesta HTTP 200 con la lista de órdenes.
 * 6. Maneja errores y los transforma en respuestas HTTP consistentes.
 *
 * @param {APIGatewayProxyEvent} event - Evento recibido desde API Gateway con pathParams (userId) y queryParams (limit, cursor, etc.).
 * @returns {Promise<APIGatewayProxyResult>} - Respuesta HTTP (200 con la lista de órdenes, error en caso contrario).
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const dependencies = factory();
  dependencies.logger.info('📥 Incoming request', { event });

  try {
    const validated = await validationHttps(event, { pathSchema, querySchema });
    logger.debug('✅ Validation passed', validated);
    const adapter = getByUserOrdersHttpAdapter(useCaseGetByUserOrders());

    const response = await adapter(event, dependencies);
    logger.info('✅ Get order user', response);

    return _200_OK_(response);
  } catch (err) {
    logger.error('❌ Error in get order user', { err });
    return toHttpResponse(err);
  }
};
