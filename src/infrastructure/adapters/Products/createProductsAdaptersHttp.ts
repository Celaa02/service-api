import { APIGatewayProxyEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';

import { createProductsDependencies } from '../../../case/useCaseCreateProducts/CreateProductsDepencies';
import { createProductsType } from '../../../case/useCaseCreateProducts/createProductsType';
import { productCreate } from '../../../domain/models/ProductsMondels';
import { parseBody } from '../../../utils/utilsResponse';

/**
 * HTTP Adapter para el caso de uso `createProducts`.
 *
 * Este adapter traduce la entrada del evento HTTP (API Gateway)
 * al formato esperado por el caso de uso de creación de productos.
 *
 * Flujo:
 * 1. Registra el evento entrante en logs.
 * 2. Verifica que el `body` esté presente en la petición.
 * 3. Parsea y valida el `body` usando `parseBody`.
 * 4. Construye un objeto `productCreate` con un `productId` generado (UUID) y fecha `createdAt`.
 * 5. Ejecuta el caso de uso con dependencias e input.
 * 6. Retorna la respuesta del caso de uso al handler.
 *
 * @param {createProductsType} doCase - Caso de uso para crear productos.
 * @returns {Function} - Función que recibe el evento HTTP y dependencias para ejecutar el caso de uso.
 */
export const createProductsHttpAdapter =
  (doCase: createProductsType) =>
  async (event: APIGatewayProxyEvent, dependencies: createProductsDependencies) => {
    dependencies.logger.info(event);

    if (!event.body) {
      throw new Error('Request body is required');
    }
    const body = parseBody<productCreate>(event);
    const now = new Date().toISOString();

    const input: productCreate = {
      productId: randomUUID(),
      name: body.name,
      price: body.price,
      stock: body.stock,
      status: body.status,
      createdAt: now,
    };
    const response = await doCase(dependencies, input);
    return response;
  };
