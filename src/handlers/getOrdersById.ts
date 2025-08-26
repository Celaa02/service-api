import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getByIdOrdersDependencies } from '../domain/case/dependencies/getByIdOrders/getByIdOrdersDepencies';
import { useCaseGetByIdOrders } from '../domain/case/useCaseGetByIdOrders';
import { getByIdOrdersHttpAdapter } from '../infrastructure/adapters/getByIdOrdersAdaptersHttp';
import { OrderRepositoryDynamoDB } from '../infrastructure/repository/dynamonDBRepository';
import { _200_OK_, _404_NOT_FOUND_ } from '../utils/HttpResponse';
import { toHttpResponse } from '../utils/HttpResponseErrors';
import { logger } from '../utils/Logger';
import { validationHttps } from '../utils/ValidationsHttps';
import { getByIdOrdersSchema } from './schemas/getByIdOrdersSchemaHttp';

const factory = (): getByIdOrdersDependencies => ({
  repository: new OrderRepositoryDynamoDB(),
  logger,
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const dependencies = factory();
  dependencies.logger.info('📥 Incoming request', { event });

  try {
    const validated = await validationHttps(event, getByIdOrdersSchema);
    logger.debug('✅ Validation passed', validated);
    const adapter = getByIdOrdersHttpAdapter(useCaseGetByIdOrders());

    const response = await adapter(event, dependencies);
    logger.info('✅ Get order', response);

    if (response === null) {
      return _404_NOT_FOUND_({
        message: 'The orderId does not exist or is not confirmed.',
        data: [],
      });
    }
    return _200_OK_(response);
  } catch (err) {
    logger.error('❌ Error in get order', { err });
    return toHttpResponse(err);
  }
};
