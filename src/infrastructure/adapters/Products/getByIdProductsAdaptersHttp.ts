import { APIGatewayProxyEvent } from 'aws-lambda';

import { getByIdProductsDependencies } from '../../../case/useCaseGetByIdProducts/getByIdOrdersDepencies';
import { getByIdProductsType } from '../../../case/useCaseGetByIdProducts/getByIdOrdersType';

/**
 * HTTP Adapter para el caso de uso `getByIdProducts`.
 *
 * Este adapter traduce la entrada del evento HTTP (API Gateway)
 * al formato esperado por el caso de uso de obtención de un producto por ID.
 *
 * Flujo:
 * 1. Registra el evento entrante en logs.
 * 2. Obtiene el `productId` desde `pathParameters`.
 * 3. Si no existe `productId`, lanza un error.
 * 4. Ejecuta el caso de uso con las dependencias inyectadas y el `productId`.
 * 5. Retorna la respuesta del caso de uso al handler.
 *
 * @param {getByIdProductsType} doCase - Caso de uso para obtener un producto por ID.
 * @returns {Function} - Función que recibe el evento HTTP y dependencias para ejecutar el caso de uso.
 */
export const getByIdProductsHttpAdapter =
  (doCase: getByIdProductsType) =>
  async (event: APIGatewayProxyEvent, dependencies: getByIdProductsDependencies) => {
    dependencies.logger.info(event);
    const productId = event.pathParameters?.productId;

    if (!productId) {
      throw new Error('Request pathParameters is required');
    }
    const response = await doCase(dependencies, productId);
    return response;
  };
