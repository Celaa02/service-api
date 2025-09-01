import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { createOrdersDependencies } from '../case/useCaseCreateOrders/CreateOrdersDepencies';
import { useCaseCreateOrders } from '../case/useCaseCreateOrders/useCaseCreateOrders';
import { OrderRepositoryDynamoDB } from '../infrastructure/repository/ordersRepository';
import { _201_CREATED_ } from '../utils/HttpResponse';
import { toHttpResponse } from '../utils/HttpResponseErrors';
import { logger } from '../utils/Logger';
import { validationHttps } from '../utils/ValidationsHttps';
import { bodySchema } from './schemas/Orders/createOrdersSchemaHttp';
import { createOrdersHttpAdapter } from '../infrastructure/adapters/Orders/createOrdersAdaptersHttp';

/**
 * Factoría para inyectar dependencias necesarias en el caso de uso `createOrders`.
 *
 * @returns {createOrdersDependencies} - Repositorios y logger configurados para el caso de uso.
 */
const factory = (): createOrdersDependencies => ({
  repository: new OrderRepositoryDynamoDB(),
  logger,
});

/**
 * Lambda handler para el endpoint **POST /orders**.
 *
 * Flujo:
 * 1. Registra la petición entrante en logs.
 * 2. Valida el cuerpo del request con `bodySchema`.
 * 3. Adapta el caso de uso `useCaseCreateOrders` al formato HTTP.
 * 4. Ejecuta la lógica de negocio para crear una orden.
 * 5. Retorna respuesta 201 (Created) si es exitoso.
 * 6. Maneja errores y los transforma en respuestas HTTP adecuadas.
 *
 * @param {APIGatewayProxyEvent} event - Evento recibido desde API Gateway.
 * @returns {Promise<APIGatewayProxyResult>} - Respuesta HTTP (201 si se creó la orden, error en caso contrario).
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const dependencies = factory();
  dependencies.logger.info('📥 Incoming request', { event });

  try {
    const validated = await validationHttps(event, { bodySchema });
    logger.debug('✅ Validation passed', validated);
    const adapter = createOrdersHttpAdapter(useCaseCreateOrders());

    const response = await adapter(event, dependencies);
    logger.debug('✅ Order created ', response);

    return _201_CREATED_(response);
  } catch (err) {
    logger.error('❌ Error in createOrder', { err });
    return toHttpResponse(err);
  }
};
