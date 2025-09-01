import { APIGatewayProxyEvent } from 'aws-lambda';

import { updateByIdProductsDependencies } from '../../../case/useCaseUpdateByIdProducts/updateByIdProductsDepencies';
import { updateByIdProductsType } from '../../../case/useCaseUpdateByIdProducts/updateByIdProductsType';
import { productCreate } from '../../../domain/models/ProductsMondels';
import { parseBody } from '../../../utils/utilsResponse';

/**
 * HTTP Adapter para el caso de uso `updateByIdProducts`.
 *
 * Este adapter traduce la entrada del evento HTTP (API Gateway)
 * al formato esperado por el caso de uso de actualización de productos.
 *
 * Flujo:
 * 1. Registra el evento entrante en logs.
 * 2. Obtiene el `productId` desde `pathParameters`.
 * 3. Si no existe `productId`, lanza un error.
 * 4. Parsea y valida el `body` de la petición con `parseBody`.
 * 5. Construye el input para el caso de uso, agregando `createdAt` con fecha actual.
 * 6. Ejecuta el caso de uso con dependencias e input.
 * 7. Retorna la respuesta del caso de uso al handler.
 *
 * @param {updateByIdProductsType} doCase - Caso de uso para actualizar un producto.
 * @returns {Function} - Función que recibe el evento HTTP y dependencias para ejecutar el caso de uso.
 */
export const updateByIdProductsHttpAdapter =
  (doCase: updateByIdProductsType) =>
  async (event: APIGatewayProxyEvent, dependencies: updateByIdProductsDependencies) => {
    dependencies.logger.info(event);
    const productId = event.pathParameters?.productId;

    if (!productId) {
      throw new Error('Request pathParametersor is required');
    }
    const body = parseBody<productCreate>(event);
    const now = new Date().toISOString();

    const response = await doCase(dependencies, {
      productId: productId,
      name: body.name,
      price: body.price,
      stock: body.stock,
      status: body.status,
      createdAt: now,
    });
    return response;
  };
