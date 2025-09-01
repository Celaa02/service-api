import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getByIdProductsDependencies } from '../case/useCaseGetByIdProducts/getByIdOrdersDepencies';
import { useCaseGetByIdProducts } from '../case/useCaseGetByIdProducts/useCaseGetByIdProducts';
import { getByIdProductsHttpAdapter } from '../infrastructure/adapters/Products/getByIdProductsAdaptersHttp';
import { ProductRepositoryDynamoDB } from '../infrastructure/repository/productsRepository';
import { _200_OK_, _404_NOT_FOUND_ } from '../utils/HttpResponse';
import { toHttpResponse } from '../utils/HttpResponseErrors';
import { logger } from '../utils/Logger';
import { validationHttps } from '../utils/ValidationsHttps';
import { pathSchema } from './schemas/Products/getByIdProductsSchemaHttp';

/**
 * Factoría para inyectar dependencias necesarias en el caso de uso `getByIdProducts`.
 *
 * @returns {getByIdProductsDependencies} - Repositorio de productos y logger configurados.
 */
const factory = (): getByIdProductsDependencies => ({
  repository: new ProductRepositoryDynamoDB(),
  logger,
});

/**
 * Lambda handler para el endpoint **GET /products/{id}**.
 *
 * Flujo principal:
 * 1. Registra la petición entrante en logs.
 * 2. Valida el parámetro de ruta (`pathSchema`).
 * 3. Adapta el caso de uso `useCaseGetByIdProducts` al formato HTTP.
 * 4. Ejecuta la lógica de negocio para obtener un producto por su ID.
 * 5. Si no se encuentra, retorna HTTP 404 con un mensaje descriptivo.
 * 6. Si existe, retorna HTTP 200 con el producto.
 * 7. Maneja errores y los transforma en respuestas HTTP consistentes.
 *
 * @param {APIGatewayProxyEvent} event - Evento recibido desde API Gateway con pathParams (productId).
 * @returns {Promise<APIGatewayProxyResult>} - Respuesta HTTP (200 con el producto, 404 si no existe, error en caso contrario).
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const dependencies = factory();
  dependencies.logger.info('📥 Incoming request', { event });

  try {
    const validated = await validationHttps(event, { pathSchema });
    logger.debug('✅ Validation passed', validated);
    const adapter = getByIdProductsHttpAdapter(useCaseGetByIdProducts());

    const response = await adapter(event, dependencies);
    logger.info('✅ Get product', response);

    if (response === null) {
      return _404_NOT_FOUND_({
        message: 'The productsId does not exist or is not active.',
        data: [],
      });
    }
    return _200_OK_(response);
  } catch (err) {
    logger.error('❌ Error in get products', { err });
    return toHttpResponse(err);
  }
};
