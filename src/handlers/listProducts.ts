import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { listProductsDependencies } from '../case/useCaseListProducts/listProductsDepencies';
import { useCaseListProducts } from '../case/useCaseListProducts/useCaseListProducts';
import { listProductsHttpAdapter } from '../infrastructure/adapters/Products/listProductsAdaptersHttp';
import { ProductRepositoryDynamoDB } from '../infrastructure/repository/productsRepository';
import { _200_OK_ } from '../utils/HttpResponse';
import { toHttpResponse } from '../utils/HttpResponseErrors';
import { logger } from '../utils/Logger';

/**
 * Factoría para inyectar dependencias necesarias en el caso de uso `listProducts`.
 *
 * @returns {listProductsDependencies} - Repositorio de productos y logger configurados.
 */
const factory = (): listProductsDependencies => ({
  repository: new ProductRepositoryDynamoDB(),
  logger,
});

/**
 * Lambda handler para el endpoint **GET /products**.
 *
 * Flujo principal:
 * 1. Registra la petición entrante en logs.
 * 2. Adapta el caso de uso `useCaseListProducts` al formato HTTP.
 * 3. Ejecuta la lógica de negocio para obtener la lista de productos.
 * 4. Retorna una respuesta HTTP 200 con la lista.
 * 5. Maneja errores y los transforma en respuestas HTTP consistentes.
 *
 * @param {APIGatewayProxyEvent} event - Evento recibido desde API Gateway.
 * @returns {Promise<APIGatewayProxyResult>} - Respuesta HTTP (200 con la lista de productos o error en caso contrario).
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const dependencies = factory();
  dependencies.logger.info('📥 Incoming request', { event });

  try {
    const adapter = listProductsHttpAdapter(useCaseListProducts());
    const response = await adapter(event, dependencies);
    logger.debug('✅ List products ', response);

    return _200_OK_(response);
  } catch (err) {
    logger.error('❌ Error in list products', { err });
    return toHttpResponse(err);
  }
};
