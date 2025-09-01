import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { updateByIdProductsDependencies } from '../case/useCaseUpdateByIdProducts/updateByIdProductsDepencies';
import { useCaseUpdateByIdProducts } from '../case/useCaseUpdateByIdProducts/useCaseUpdateByIdProduct';
import { updateByIdProductsHttpAdapter } from '../infrastructure/adapters/Products/updateByIdProductsAdaptersHttp';
import { ProductRepositoryDynamoDB } from '../infrastructure/repository/productsRepository';
import { _200_OK_, _404_NOT_FOUND_ } from '../utils/HttpResponse';
import { toHttpResponse } from '../utils/HttpResponseErrors';
import { logger } from '../utils/Logger';
import { validationHttps } from '../utils/ValidationsHttps';
import { pathSchema } from './schemas/Products/updateByIdProductsSchemaHttp';

/**
 * Factoría para inyectar dependencias necesarias en el caso de uso `updateByIdProducts`.
 *
 * @returns {updateByIdProductsDependencies} - Repositorio de productos y logger configurados.
 */
const factory = (): updateByIdProductsDependencies => ({
  repository: new ProductRepositoryDynamoDB(),
  logger,
});

/**
 * Lambda handler para el endpoint **PATCH /products/{id}**.
 *
 * Flujo principal:
 * 1. Registra la petición entrante en logs.
 * 2. Valida el parámetro de la ruta (`pathSchema`).
 * 3. Adapta el caso de uso `useCaseUpdateByIdProducts` al formato HTTP.
 * 4. Ejecuta la lógica de negocio para actualizar un producto por su ID.
 * 5. Si no se encuentra el producto o no está en estado válido, retorna HTTP 404 con un mensaje descriptivo.
 * 6. Si la actualización es exitosa, retorna HTTP 200 con el producto actualizado.
 * 7. Maneja errores y los transforma en respuestas HTTP consistentes.
 *
 * @param {APIGatewayProxyEvent} event - Evento recibido desde API Gateway con pathParams (productId).
 * @returns {Promise<APIGatewayProxyResult>} - Respuesta HTTP (200 con producto actualizado, 404 si no existe/estado inválido, error en caso contrario).
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const dependencies = factory();
  dependencies.logger.info('📥 Incoming request', { event });

  try {
    const validated = await validationHttps(event, { pathSchema });
    logger.debug('✅ Validation passed', validated);
    const adapter = updateByIdProductsHttpAdapter(useCaseUpdateByIdProducts());

    const response = await adapter(event, dependencies);
    logger.info('✅ Update product id', response);

    if (response === null) {
      return _404_NOT_FOUND_({
        message: 'Product not in CREATED.',
        data: [],
      });
    }

    return _200_OK_(response);
  } catch (err) {
    logger.error('❌ Error in update product id', { err });
    return toHttpResponse(err);
  }
};
