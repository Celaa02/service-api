import { Logger } from 'winston';

import { ProductsRepository } from '../../domain/repository/productsRepository';

export type createProductsDependencies = {
  repository: ProductsRepository;
  logger: Logger;
};
