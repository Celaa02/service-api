import { APIGatewayProxyEvent } from 'aws-lambda';

import { listProductsDependencies } from '../../../case/useCaseListProducts/listProductsDepencies';
import { listProductsType } from '../../../case/useCaseListProducts/listProductsType';
import { listProduct } from '../../../domain/models/ProductsMondels';

export const listProductsHttpAdapter =
  (doCase: listProductsType) =>
  async (event: APIGatewayProxyEvent, dependencies: listProductsDependencies) => {
    dependencies.logger.info(event);

    const limit = event.queryStringParameters?.limit;
    const cursor = event.queryStringParameters?.cursor;

    if (!limit) {
      throw new Error('Request queryStringParameters is required');
    }

    const input: listProduct = {
      limit: Number(limit),
      cursor: cursor,
    };
    const response = await doCase(dependencies, input);
    return response;
  };
