import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { createProductsDependencies } from '../case/useCaseCreateProducts/CreateProductsDepencies';
import { useCaseCreateProducts } from '../case/useCaseCreateProducts/useCaseCreateProducts';
import { ProductRepositoryDynamoDB } from '../infrastructure/repository/productsRepository';
import { _201_CREATED_ } from '../utils/HttpResponse';
import { toHttpResponse } from '../utils/HttpResponseErrors';
import { logger } from '../utils/Logger';
import { validationHttps } from '../utils/ValidationsHttps';
import { bodySchema } from './schemas/Products/createProductsSchemaHttp';
import { createProductsHttpAdapter } from '../infrastructure/adapters/Products/createProductsAdaptersHttp';

/**
 * Factoría para inyectar las dependencias necesarias en el caso de uso `createProducts`.
 *
 * @returns {createProductsDependencies} - Repositorio de productos y logger configurados.
 */
const factory = (): createProductsDependencies => ({
  repository: new ProductRepositoryDynamoDB(),
  logger,
});

/**
 * Lambda handler para el endpoint **POST /products**.
 *
 * Flujo principal:
 * 1. Registra la petición entrante en los logs.
 * 2. Valida el cuerpo del request contra el esquema `bodySchema`.
 * 3. Adapta el caso de uso `useCaseCreateProducts` al formato HTTP.
 * 4. Ejecuta la lógica de negocio para crear productos.
 * 5. Retorna una respuesta HTTP con código 201 (Created) si es exitoso.
 * 6. En caso de error, lo transforma en una respuesta HTTP adecuada.
 *
 * @param {APIGatewayProxyEvent} event - Evento recibido desde API Gateway con los datos de la petición.
 * @returns {Promise<APIGatewayProxyResult>} - Respuesta HTTP (201 si se crearon productos, error en caso contrario).
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const dependencies = factory();
  dependencies.logger.info('📥 Incoming request', { event });

  try {
    const validated = await validationHttps(event, { bodySchema });
    logger.debug('✅ Validation passed', validated);
    const adapter = createProductsHttpAdapter(useCaseCreateProducts());

    const response = await adapter(event, dependencies);
    logger.debug('✅ Products created ', response);

    return _201_CREATED_(response);
  } catch (err) {
    logger.error('❌ Error in products create', { err });
    return toHttpResponse(err);
  }
};
