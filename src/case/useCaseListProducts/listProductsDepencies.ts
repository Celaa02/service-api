import { Logger } from 'winston';

import { ProductsRepository } from '../../domain/repository/productsRepository';

export type listProductsDependencies = {
  repository: ProductsRepository;
  logger: Logger;
};
