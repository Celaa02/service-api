import { Logger } from 'winston';

import { ProductsRepository } from '../../domain/repository/productsRepository';

/**
 * Dependencias requeridas para el caso de uso `listProducts`.
 *
 * Contiene los componentes necesarios para ejecutar la lógica
 * de listado de productos.
 */
export type listProductsDependencies = {
  repository: ProductsRepository;
  logger: Logger;
};
