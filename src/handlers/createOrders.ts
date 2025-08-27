import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { createOrdersDependencies } from '../case/useCaseCreateOrders/CreateOrdersDepencies';
import { useCaseCreateOrders } from '../case/useCaseCreateOrders/useCaseCreateOrders';
import { OrderRepositoryDynamoDB } from '../infrastructure/repository/dynamonDBRepository';
import { _201_CREATED_ } from '../utils/HttpResponse';
import { toHttpResponse } from '../utils/HttpResponseErrors';
import { logger } from '../utils/Logger';
import { validationHttps } from '../utils/ValidationsHttps';
import { createOrdersSchema } from './schemas/createOrdersSchemaHttp';
import { createOrdersHttpAdapter } from '../infrastructure/adapters/createOrdersAdaptersHttp';

const factory = (): createOrdersDependencies => ({
  repository: new OrderRepositoryDynamoDB(),
  logger,
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const dependencies = factory();
  dependencies.logger.info('📥 Incoming request', { event });

  try {
    const validated = await validationHttps(event, createOrdersSchema);
    logger.debug('✅ Validation passed', validated);
    const adapter = createOrdersHttpAdapter(useCaseCreateOrders());

    const response = await adapter(event, dependencies);
    logger.debug('✅ Order created ', response);

    return _201_CREATED_(response);
  } catch (err) {
    logger.error('❌ Error in createOrder', { err });
    return toHttpResponse(err);
  }
};
