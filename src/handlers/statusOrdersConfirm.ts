import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { statusConfirmOders } from '../case/statusConfirmOders/statusConfirmOders';
import { confirmStatusOrdersHttpAdapter } from '../infrastructure/adapters/Orders/confirmStatusOrdersAdaptersHttp';
import { OrderRepositoryDynamoDB } from '../infrastructure/repository/ordersRepository';
import { _200_OK_, _404_NOT_FOUND_ } from '../utils/HttpResponse';
import { toHttpResponse } from '../utils/HttpResponseErrors';
import { logger } from '../utils/Logger';
import { validationHttps } from '../utils/ValidationsHttps';
import { pathSchema } from './schemas/Orders/statusConfirmOrdersSchemaHttp';
import { statusConfirmOrdersDependencies } from '../case/statusConfirmOders/statusConfirmOrdersDepencies';
import { ProductRepositoryDynamoDB } from '../infrastructure/repository/productsRepository';

/**
 * Factoría para inyectar dependencias necesarias en el caso de uso `statusConfirmOrders`.
 *
 * @returns {statusConfirmOrdersDependencies} - Repositorios de órdenes, productos y logger configurados.
 */
const factory = (): statusConfirmOrdersDependencies => ({
  repositoryOrders: new OrderRepositoryDynamoDB(),
  repositoryProduct: new ProductRepositoryDynamoDB(),
  logger,
});

/**
 * Lambda handler para el endpoint **PATCH /orders/{id}/confirm**.
 *
 * Flujo principal:
 * 1. Registra la petición entrante en logs.
 * 2. Valida los parámetros de la ruta (`pathSchema`).
 * 3. Adapta el caso de uso `statusConfirmOrders` al formato HTTP.
 * 4. Ejecuta la lógica de negocio para confirmar una orden.
 *    - Si la orden está en estado `CREATED`, se actualiza a `CONFIRMED`.
 *    - También decrementa stock de productos asociados.
 * 5. Si la orden no está en estado válido, retorna HTTP 404 con un mensaje descriptivo.
 * 6. Si la confirmación es exitosa, retorna HTTP 200 con los datos de la orden confirmada.
 * 7. Maneja errores y los transforma en respuestas HTTP consistentes.
 *
 * @param {APIGatewayProxyEvent} event - Evento recibido desde API Gateway con pathParams (orderId).
 * @returns {Promise<APIGatewayProxyResult>} - Respuesta HTTP (200 con orden confirmada, 404 si no está en CREATED, error en caso contrario).
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const dependencies = factory();
  dependencies.logger.info('📥 Incoming request', { event });

  try {
    const validated = await validationHttps(event, { pathSchema });
    logger.debug('✅ Validation passed', validated);
    const adapter = confirmStatusOrdersHttpAdapter(statusConfirmOders());

    const response = await adapter(event, dependencies);
    logger.info('✅ Get order user', response);

    if (response === null) {
      return _404_NOT_FOUND_({
        message: 'Order not in CREATED status, cannot confirm.',
        data: [],
      });
    }

    return _200_OK_(response);
  } catch (err) {
    logger.error('❌ Error in get order user', { err });
    return toHttpResponse(err);
  }
};
