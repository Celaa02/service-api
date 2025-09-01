import { getByIdProductsDependencies } from './getByIdOrdersDepencies';
import { getByIdProductsType } from './getByIdOrdersType';

/**
 * Caso de uso: Obtener un producto por su ID.
 *
 * Este caso de uso se encarga de:
 * 1. Recibir el `productId` como input.
 * 2. Consultar el repositorio de productos para obtener el producto asociado.
 * 3. Registrar en logs el resultado de la operación.
 * 4. Retornar el producto encontrado o `null` si no existe.
 *
 * @returns {getByIdProductsType} - Función que recibe dependencias e input `productId`.
 */
export const useCaseGetByIdProducts =
  (): getByIdProductsType => async (dependencies: getByIdProductsDependencies, input: string) => {
    const { repository, logger } = dependencies;
    const response = await repository.getProductById(input);
    logger.info('✅ Get product', response);
    return response;
  };
