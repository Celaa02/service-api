import { APIGatewayProxyEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';

import { statusConfirmOrdersDependencies } from '../../../case/statusConfirmOders/statusConfirmOrdersDepencies';
import { statusConfirmOrderType } from '../../../case/statusConfirmOders/statusConfrimOrdersType';

export const confirmStatusOrdersHttpAdapter =
  (doCase: statusConfirmOrderType) =>
  async (event: APIGatewayProxyEvent, dependencies: statusConfirmOrdersDependencies) => {
    dependencies.logger.info(event);
    const id = event.pathParameters?.orderId;

    if (!id) {
      throw new Error('Request pathParametersor is required');
    }
    const response = await doCase(dependencies, {
      orderId: id,
      paymentId: randomUUID(),
    });
    return response;
  };
