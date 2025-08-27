import { APIGatewayProxyEvent } from 'aws-lambda';

import { getByUserOrdersDependencies } from '../../domain/case/dependencies/getByUserOrders/getByUserOrdersDepencies';
import { getByUsrOrderType } from '../../domain/case/dependencies/getByUserOrders/getByUserOrdersType';

export const getByUserOrdersHttpAdapter =
  (doCase: getByUsrOrderType) =>
  async (event: APIGatewayProxyEvent, dependencies: getByUserOrdersDependencies) => {
    dependencies.logger.info(event);
    const id = event.pathParameters?.userId;
    const limit = event.queryStringParameters?.limit;

    if (!id || !limit) {
      throw new Error('Request pathParametersor or queryStringParameters is required');
    }
    const response = await doCase(dependencies, {
      userId: id,
      limit: Number(limit),
    });
    return response;
  };
