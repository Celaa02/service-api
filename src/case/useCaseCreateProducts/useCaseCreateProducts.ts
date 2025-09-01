import { createProductsDependencies } from './CreateProductsDepencies';
import { createProductsType } from './createProductsType';
import { productCreate } from '../../domain/models/ProductsMondels';

/**
 * Caso de uso: Crear un producto.
 *
 * Este caso de uso se encarga de:
 * 1. Recibir la información de un producto a crear.
 * 2. Guardar el producto en el repositorio de persistencia (`repository`).
 * 3. Registrar el resultado en los logs.
 * 4. Retornar el producto creado o la respuesta del repositorio.
 *
 * @returns {createProductsType} - Función que recibe dependencias e input `productCreate`.
 */
export const useCaseCreateProducts =
  (): createProductsType =>
  async (dependencies: createProductsDependencies, input: productCreate) => {
    const { repository, logger } = dependencies;
    const response = await repository.createProduct(input);
    logger.info('✅ order', response);
    return response;
  };
