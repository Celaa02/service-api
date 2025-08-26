import { APIGatewayProxyEvent } from 'aws-lambda';

import { getByIdOrdersDependencies } from '../../domain/case/dependencies/getByIdOrders/getByIdOrdersDepencies';
import { getByIdOrderType } from '../../domain/case/dependencies/getByIdOrders/getByIdOrdersType';

export const getByIdOrdersHttpAdapter =
  (doCase: getByIdOrderType) =>
  async (event: APIGatewayProxyEvent, dependencies: getByIdOrdersDependencies) => {
    dependencies.logger.info(event);
    const id = event.pathParameters?.id;

    if (!id) {
      throw new Error('Request body is required');
    }
    const response = await doCase(dependencies, {
      orderId: id,
    });
    return response;
  };
