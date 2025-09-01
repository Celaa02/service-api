import { Logger } from 'winston';

import { ProductsRepository } from '../../domain/repository/productsRepository';

/**
 * Dependencias requeridas para el caso de uso `updateByIdProducts`.
 *
 * Contiene los componentes necesarios para ejecutar la lógica
 * de actualización de un producto por su ID.
 */
export type updateByIdProductsDependencies = {
  repository: ProductsRepository;
  logger: Logger;
};
