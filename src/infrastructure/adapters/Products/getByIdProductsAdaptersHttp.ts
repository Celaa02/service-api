import { APIGatewayProxyEvent } from 'aws-lambda';

import { getByIdProductsDependencies } from '../../../case/useCaseGetByIdProducts/getByIdOrdersDepencies';
import { getByIdProductsType } from '../../../case/useCaseGetByIdProducts/getByIdOrdersType';

export const getByIdProductsHttpAdapter =
  (doCase: getByIdProductsType) =>
  async (event: APIGatewayProxyEvent, dependencies: getByIdProductsDependencies) => {
    dependencies.logger.info(event);
    const productId = event.pathParameters?.productId;

    if (!productId) {
      throw new Error('Request pathParameters is required');
    }
    const response = await doCase(dependencies, productId);
    return response;
  };
