import { updateByIdProductsDependencies } from './updateByIdProductsDepencies';
import { updateByIdProductsType } from './updateByIdProductsType';
import { UpdateProductInput } from '../../domain/models/ProductsMondels';

/**
 * Caso de uso: Actualizar un producto por su ID.
 *
 * Este caso de uso se encarga de:
 * 1. Recibir el input con los datos a actualizar (`UpdateProductInput`).
 * 2. Ejecutar la actualización en el repositorio de productos.
 * 3. Registrar en logs el resultado de la operación.
 * 4. Retornar el producto actualizado o `null` si no existe.
 *
 * @returns {updateByIdProductsType} - Función que recibe dependencias e input `UpdateProductInput`.
 */
export const useCaseUpdateByIdProducts =
  (): updateByIdProductsType =>
  async (dependencies: updateByIdProductsDependencies, input: UpdateProductInput) => {
    const { repository, logger } = dependencies;
    const response = await repository.updateProduct(input);
    logger.info('✅ Update product id', response);
    return response;
  };
