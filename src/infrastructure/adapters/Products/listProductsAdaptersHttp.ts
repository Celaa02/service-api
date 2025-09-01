import { APIGatewayProxyEvent } from 'aws-lambda';

import { listProductsDependencies } from '../../../case/useCaseListProducts/listProductsDepencies';
import { listProductsType } from '../../../case/useCaseListProducts/listProductsType';

/**
 * HTTP Adapter para el caso de uso `listProducts`.
 *
 * Este adapter traduce la entrada del evento HTTP (API Gateway)
 * al formato esperado por el caso de uso de listado de productos.
 *
 * Flujo:
 * 1. Registra el evento entrante en logs.
 * 2. Ejecuta el caso de uso con las dependencias inyectadas.
 * 3. Retorna la respuesta del caso de uso al handler.
 *
 * @param {listProductsType} doCase - Caso de uso para listar productos.
 * @returns {Function} - Función que recibe el evento HTTP y dependencias para ejecutar el caso de uso.
 */
export const listProductsHttpAdapter =
  (doCase: listProductsType) =>
  async (event: APIGatewayProxyEvent, dependencies: listProductsDependencies) => {
    dependencies.logger.info(event);
    const response = await doCase(dependencies);
    return response;
  };
