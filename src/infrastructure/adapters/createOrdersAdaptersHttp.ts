import { APIGatewayProxyEvent } from 'aws-lambda';

import { createOrdersDependencies } from '../../domain/case/dependencies/createOrders/CreateOrdersDepencies';
import { createOrderType } from '../../domain/case/dependencies/createOrders/createOrdersType';
import { createOrders } from '../../domain/models/OrdersModelsHttp';
import { parseBody } from '../../utils/utilsResponse';

export const createOrdersHttpAdapter =
  (doCase: createOrderType) =>
  async (event: APIGatewayProxyEvent, dependencies: createOrdersDependencies) => {
    dependencies.logger.info(event);
    if (!event.body) {
      throw new Error('Request body is required');
    }
    const body = parseBody<createOrders>(event);
    const input: createOrders = {
      userId: body.userId,
      items: body.items,
      total: body.total,
      status: body.status,
    };
    const response = await doCase(dependencies, input);
    return response;
  };
