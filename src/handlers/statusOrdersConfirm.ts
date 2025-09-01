import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { statusConfirmOders } from '../case/statusConfirmOders/statusConfirmOders';
import { confirmStatusOrdersHttpAdapter } from '../infrastructure/adapters/Orders/confirmStatusOrdersAdaptersHttp';
import { OrderRepositoryDynamoDB } from '../infrastructure/repository/ordersRepository';
import { _200_OK_, _404_NOT_FOUND_ } from '../utils/HttpResponse';
import { toHttpResponse } from '../utils/HttpResponseErrors';
import { logger } from '../utils/Logger';
import { validationHttps } from '../utils/ValidationsHttps';
import { pathSchema } from './schemas/Orders/statusConfirmOrdersSchemaHttp';
import { statusConfirmOrdersDependencies } from '../case/statusConfirmOders/statusConfirmOrdersDepencies';
import { ProductRepositoryDynamoDB } from '../infrastructure/repository/productsRepository';

const factory = (): statusConfirmOrdersDependencies => ({
  repositoryOrders: new OrderRepositoryDynamoDB(),
  repositoryProduct: new ProductRepositoryDynamoDB(),
  logger,
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const dependencies = factory();
  dependencies.logger.info('📥 Incoming request', { event });

  try {
    const validated = await validationHttps(event, { pathSchema });
    logger.debug('✅ Validation passed', validated);
    const adapter = confirmStatusOrdersHttpAdapter(statusConfirmOders());

    const response = await adapter(event, dependencies);
    logger.info('✅ Get order user', response);

    if (response === null) {
      return _404_NOT_FOUND_({
        message: 'Order not in CREATED status, cannot confirm.',
        data: [],
      });
    }

    return _200_OK_(response);
  } catch (err) {
    logger.error('❌ Error in get order user', { err });
    return toHttpResponse(err);
  }
};
