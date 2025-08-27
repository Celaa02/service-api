import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getByUserOrdersHttpAdapter } from '../infrastructure/adapters/getByUserOrdersAdaptersHttp';
import { OrderRepositoryDynamoDB } from '../infrastructure/repository/dynamonDBRepository';
import { _200_OK_ } from '../utils/HttpResponse';
import { toHttpResponse } from '../utils/HttpResponseErrors';
import { logger } from '../utils/Logger';
import { validationHttps } from '../utils/ValidationsHttps';
import { getByUserOrdersSchema } from './schemas/getByUserOrdersSchemaHttp';
import { getByUserOrdersDependencies } from '../case/useCaseGetByUserOders/getByUserOrdersDepencies';
import { useCaseGetByUserOrders } from '../case/useCaseGetByUserOders/useCaseGetByUserOders';

const factory = (): getByUserOrdersDependencies => ({
  repository: new OrderRepositoryDynamoDB(),
  logger,
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const dependencies = factory();
  dependencies.logger.info('📥 Incoming request', { event });

  try {
    const validated = await validationHttps(event, getByUserOrdersSchema);
    logger.debug('✅ Validation passed', validated);
    const adapter = getByUserOrdersHttpAdapter(useCaseGetByUserOrders());

    const response = await adapter(event, dependencies);
    logger.info('✅ Get order user', response);

    return _200_OK_(response);
  } catch (err) {
    logger.error('❌ Error in get order user', { err });
    return toHttpResponse(err);
  }
};
