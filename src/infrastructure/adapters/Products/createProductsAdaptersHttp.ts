import { APIGatewayProxyEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';

import { createProductsDependencies } from '../../../case/useCaseCreateProducts/CreateProductsDepencies';
import { createProductsType } from '../../../case/useCaseCreateProducts/createProductsType';
import { productCreate } from '../../../domain/models/ProductsMondels';
import { parseBody } from '../../../utils/utilsResponse';

export const createProductsHttpAdapter =
  (doCase: createProductsType) =>
  async (event: APIGatewayProxyEvent, dependencies: createProductsDependencies) => {
    dependencies.logger.info(event);

    if (!event.body) {
      throw new Error('Request body is required');
    }
    const body = parseBody<productCreate>(event);
    const now = new Date().toISOString();

    const input: productCreate = {
      productId: randomUUID(),
      name: body.name,
      price: body.price,
      stock: body.stock,
      status: body.status,
      createdAt: now,
    };
    const response = await doCase(dependencies, input);
    return response;
  };
