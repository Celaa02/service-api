import { listProductsDependencies } from './listProductsDepencies';
import { listProductsType } from './listProductsType';
import { listProduct } from '../../domain/models/ProductsMondels';

export const useCaseListProducts =
  (): listProductsType => async (dependencies: listProductsDependencies, input: listProduct) => {
    const { repository, logger } = dependencies;
    const response = await repository.listProducts(input);
    logger.info('✅ list products', response);
    return response;
  };
