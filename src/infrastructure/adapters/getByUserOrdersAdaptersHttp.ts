import { APIGatewayProxyEvent } from 'aws-lambda';

import { getByUserOrdersDependencies } from '../../case/useCaseGetByUserOders/getByUserOrdersDepencies';
import { getByUsrOrderType } from '../../case/useCaseGetByUserOders/getByUserOrdersType';

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
