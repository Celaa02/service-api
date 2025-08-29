import { Logger } from 'winston';

import { ProductsRepository } from '../../domain/repository/productsRepository';

export type updateByIdProductsDependencies = {
  repository: ProductsRepository;
  logger: Logger;
};
