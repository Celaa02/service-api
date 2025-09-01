import { Logger } from 'winston';

import { ProductsRepository } from '../../domain/repository/productsRepository';

/**
 * Dependencias requeridas para el caso de uso `getByIdProducts`.
 *
 * Contiene los componentes necesarios para ejecutar la lógica
 * de obtención de un producto por su ID.
 */
export type getByIdProductsDependencies = {
  repository: ProductsRepository;
  logger: Logger;
};
