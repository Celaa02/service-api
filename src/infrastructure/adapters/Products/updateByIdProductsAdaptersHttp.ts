import { APIGatewayProxyEvent } from 'aws-lambda';

import { updateByIdProductsDependencies } from '../../../case/useCaseUpdateByIdProducts/updateByIdProductsDepencies';
import { updateByIdProductsType } from '../../../case/useCaseUpdateByIdProducts/updateByIdProductsType';
import { productCreate } from '../../../domain/models/ProductsMondels';
import { parseBody } from '../../../utils/utilsResponse';

export const updateByIdProductsHttpAdapter =
  (doCase: updateByIdProductsType) =>
  async (event: APIGatewayProxyEvent, dependencies: updateByIdProductsDependencies) => {
    dependencies.logger.info(event);
    const productId = event.pathParameters?.productId;

    if (!productId) {
      throw new Error('Request pathParametersor is required');
    }
    const body = parseBody<productCreate>(event);
    const now = new Date().toISOString();

    const response = await doCase(dependencies, {
      productId: productId,
      name: body.name,
      price: body.price,
      stock: body.stock,
      status: body.status,
      createdAt: now,
    });
    return response;
  };
