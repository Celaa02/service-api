import { Logger } from 'winston';

import { ProductsRepository } from '../../domain/repository/productsRepository';

export type getByIdProductsDependencies = {
  repository: ProductsRepository;
  logger: Logger;
};
