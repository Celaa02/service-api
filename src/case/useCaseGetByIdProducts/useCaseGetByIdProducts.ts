import { getByIdProductsDependencies } from './getByIdOrdersDepencies';
import { getByIdProductsType } from './getByIdOrdersType';

export const useCaseGetByIdProducts =
  (): getByIdProductsType => async (dependencies: getByIdProductsDependencies, input: string) => {
    const { repository, logger } = dependencies;
    const response = await repository.getProductById(input);
    logger.info('✅ Get product', response);
    return response;
  };
