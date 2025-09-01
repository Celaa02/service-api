import { Logger } from 'winston';

import { ProductsRepository } from '../../domain/repository/productsRepository';

/**
 * Dependencias requeridas para el caso de uso `deleteByIdProducts`.
 *
 * Contiene los componentes necesarios para ejecutar la lógica
 * de eliminación de productos.
 */
export type deleteByIdProductsDependencies = {
  repository: ProductsRepository;
  logger: Logger;
};
