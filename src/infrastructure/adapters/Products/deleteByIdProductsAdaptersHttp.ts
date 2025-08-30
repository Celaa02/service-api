import { APIGatewayProxyEvent } from 'aws-lambda';

import { deleteByIdProductsDependencies } from '../../../case/useCaseDeleteByIdProducts/deleteByIdOrdersDepencies';
import { deleteByIdProductsType } from '../../../case/useCaseDeleteByIdProducts/deleteByIdOrdersType';

export const deleteByIdProductsHttpAdapter =
  (doCase: deleteByIdProductsType) =>
  async (event: APIGatewayProxyEvent, dependencies: deleteByIdProductsDependencies) => {
    dependencies.logger.info(event);
    const productId = event.pathParameters?.productId;

    if (!productId) {
      throw new Error('Request pathParameters is required');
    }
    const response = await doCase(dependencies, productId);
    return response;
  };
