import { listProductsDependencies } from './listProductsDepencies';
import { listProductsType } from './listProductsType';

export const useCaseListProducts =
  (): listProductsType => async (dependencies: listProductsDependencies) => {
    const { repository, logger } = dependencies;
    const response = await repository.listAll();
    logger.info('✅ list products', response);
    return response;
  };
