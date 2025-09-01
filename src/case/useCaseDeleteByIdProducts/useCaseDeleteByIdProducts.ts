import { deleteByIdProductsDependencies } from './deleteByIdOrdersDepencies';
import { deleteByIdProductsType } from './deleteByIdOrdersType';

/**
 * Caso de uso: Eliminar un producto por su ID.
 *
 * Este caso de uso se encarga de:
 * 1. Recibir el `productId` como input.
 * 2. Ejecutar la eliminación en el repositorio de productos.
 * 3. Registrar en logs el resultado de la operación.
 * 4. Retornar la respuesta del repositorio (ej. producto eliminado, estado o null si no existe).
 *
 * @returns {deleteByIdProductsType} - Función que recibe dependencias e input `productId`.
 */
export const useCaseDeleteByIdProducts =
  (): deleteByIdProductsType =>
  async (dependencies: deleteByIdProductsDependencies, input: string) => {
    const { repository, logger } = dependencies;
    const response = await repository.deleteProduct(input);
    logger.info('✅ Delete product', response);
    return response;
  };
