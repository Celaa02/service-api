import { listProductsDependencies } from './listProductsDepencies';
import { listProductsType } from './listProductsType';

/**
 * Caso de uso: Listar todos los productos.
 *
 * Este caso de uso se encarga de:
 * 1. Consultar el repositorio de productos para obtener todos los registros.
 * 2. Registrar en logs el resultado de la operación.
 * 3. Retornar la lista de productos obtenidos.
 *
 * @returns {listProductsType} - Función que recibe dependencias y retorna la lista de productos.
 */
export const useCaseListProducts =
  (): listProductsType => async (dependencies: listProductsDependencies) => {
    const { repository, logger } = dependencies;
    const response = await repository.listAll();
    logger.info('✅ list products', response);
    return response;
  };
