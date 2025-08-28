import { createProductsDependencies } from './CreateProductsDepencies';
import { createProductsType } from './createProductsType';
import { productCreate } from '../../domain/models/ProductsMondels';

export const useCaseCreateProducts =
  (): createProductsType =>
  async (dependencies: createProductsDependencies, input: productCreate) => {
    const { repository, logger } = dependencies;
    const response = await repository.createProduct(input);
    logger.info('✅ order', response);
    return response;
  };
