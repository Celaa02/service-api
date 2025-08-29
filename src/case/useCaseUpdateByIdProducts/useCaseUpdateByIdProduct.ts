import { updateByIdProductsDependencies } from './updateByIdProductsDepencies';
import { updateByIdProductsType } from './updateByIdProductsType';
import { UpdateProductInput } from '../../domain/models/ProductsMondels';

export const useCaseUpdateByIdProducts =
  (): updateByIdProductsType =>
  async (dependencies: updateByIdProductsDependencies, input: UpdateProductInput) => {
    const { repository, logger } = dependencies;
    const response = await repository.updateProduct(input);
    logger.info('✅ Update product id', response);
    return response;
  };
