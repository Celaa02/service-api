import { deleteByIdProductsDependencies } from './deleteByIdOrdersDepencies';
import { deleteByIdProductsType } from './deleteByIdOrdersType';

export const useCaseDeleteByIdProducts =
  (): deleteByIdProductsType =>
  async (dependencies: deleteByIdProductsDependencies, input: string) => {
    const { repository, logger } = dependencies;
    const response = await repository.deleteProduct(input);
    logger.info('✅ Delete product', response);
    return response;
  };
