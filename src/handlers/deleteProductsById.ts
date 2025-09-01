import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { useCaseDeleteByIdProducts } from '../case/useCaseDeleteByIdProducts/useCaseDeleteByIdProducts';
import { getByIdProductsDependencies } from '../case/useCaseGetByIdProducts/getByIdOrdersDepencies';
import { deleteByIdProductsHttpAdapter } from '../infrastructure/adapters/Products/deleteByIdProductsAdaptersHttp';
import { ProductRepositoryDynamoDB } from '../infrastructure/repository/productsRepository';
import { _200_OK_ } from '../utils/HttpResponse';
import { toHttpResponse } from '../utils/HttpResponseErrors';
import { logger } from '../utils/Logger';
import { validationHttps } from '../utils/ValidationsHttps';
import { pathSchema } from './schemas/Products/deleteByIdProductsSchemaHttp';

/**
 * Factoría para inyectar las dependencias necesarias en el caso de uso `deleteByIdProducts`.
 *
 * @returns {getByIdProductsDependencies} - Repositorio de productos y logger configurados.
 */
const factory = (): getByIdProductsDependencies => ({
  repository: new ProductRepositoryDynamoDB(),
  logger,
});

/**
 * Lambda handler para el endpoint **DELETE /products/{id}**.
 *
 * Flujo principal:
 * 1. Registra la petición entrante en logs.
 * 2. Valida los parámetros de la ruta (`pathSchema`).
 * 3. Adapta el caso de uso `useCaseDeleteByIdProducts` al formato HTTP.
 * 4. Ejecuta la lógica de negocio para eliminar un producto por su ID.
 * 5. Retorna una respuesta HTTP con código 200 (OK) si fue exitoso.
 * 6. Maneja errores y los transforma en respuestas HTTP consistentes.
 *
 * @param {APIGatewayProxyEvent} event - Evento recibido desde API Gateway con la petición.
 * @returns {Promise<APIGatewayProxyResult>} - Respuesta HTTP (200 si el producto fue eliminado, error en caso contrario).
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const dependencies = factory();
  dependencies.logger.info('📥 Incoming request', { event });

  try {
    const validated = await validationHttps(event, { pathSchema });
    logger.debug('✅ Validation passed', validated);
    const adapter = deleteByIdProductsHttpAdapter(useCaseDeleteByIdProducts());

    const response = await adapter(event, dependencies);
    logger.info('✅ Delete product', response);

    return _200_OK_(response);
  } catch (err) {
    logger.error('❌ Error in get products', { err });
    return toHttpResponse(err);
  }
};
