import { APIGatewayProxyEvent } from 'aws-lambda';

import { getByIdOrdersDependencies } from '../../../case/useCaseGetByIdOrders/getByIdOrdersDepencies';
import { getByIdOrderType } from '../../../case/useCaseGetByIdOrders/getByIdOrdersType';

export const getByIdOrdersHttpAdapter =
  (doCase: getByIdOrderType) =>
  async (event: APIGatewayProxyEvent, dependencies: getByIdOrdersDependencies) => {
    dependencies.logger.info(event);
    const id = event.pathParameters?.id;

    if (!id) {
      throw new Error('Request pathParameters is required');
    }
    const response = await doCase(dependencies, {
      orderId: id,
    });
    return response;
  };
