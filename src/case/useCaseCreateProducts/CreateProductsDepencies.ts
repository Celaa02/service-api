import { Logger } from 'winston';

import { ProductsRepository } from '../../domain/repository/productsRepository';

/**
 * Dependencias requeridas para el caso de uso `createProducts`.
 *
 * Contiene los componentes necesarios para ejecutar la lógica
 * de creación de productos.
 */
export type createProductsDependencies = {
  repository: ProductsRepository;
  logger: Logger;
};
